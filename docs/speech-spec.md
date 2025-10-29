Chào bạn\! Đây là một danh sách yêu cầu tuyệt vời và rất rõ ràng. Việc xây dựng một custom hook `useSpeech` (common) để quản lý âm thanh là một kiến trúc rất chuẩn và thông minh trong React/Next.js.

Chúng ta sẽ tạo một custom hook để đóng gói *toàn bộ* logic bạn yêu cầu, giúp cho các component UI (nút bấm, slider) của bạn trở nên rất "ngu ngốc" (dumb components) - chúng chỉ việc gọi hàm và hiển thị state từ hook.

Tuy nhiên, trước khi đi vào code, có một số **điều kiện và giới hạn rất quan trọng** bạn cần biết khi sửtrình duyệt (`Web Speech API`):

> ⚠️ **Những giới hạn BẮT BUỘC phải biết của API miễn phí**
>
> 1.  **Về giọng đọc (Features 1, 2, 5):** Số lượng và chất lượng giọng đọc (Anh, Việt, hay bất kỳ ngôn ngữ nào) **phụ thuộc 100% vào trình duyệt và hệ điều hành của người dùng**. Bạn *không thể* đảm bảo 100% người dùng sẽ có giọng `vi-VN` hay `en-GB`. Ví dụ, Chrome trên Windows thường có giọng `Google Tiếng Việt` và nhiều giọng Anh, nhưng Firefox có thể không.
> 2.  **Về "Tua" (Feature 6):** API này **không hỗ trợ tua (seek)** như một file MP3 (ví dụ: tua đến 0:30s). "Tua" ở đây được hiểu là **"Dừng và Phát lại từ đầu" (Stop/Rewind to start)**. Hàm `stop()` (tức là `speechSynthesis.cancel()`) sẽ làm việc này.
> 3.  **Về văn bản dài (Feature 3):** Hầu hết các trình duyệt có giới hạn ký tự (khoảng 32,000). Nếu văn bản quá dài, việc đọc có thể bị ngắt. Chúng ta có thể xử lý việc này, nhưng nó sẽ phức tạp hơn (ví dụ: tự ngắt câu và đưa vào hàng đợi).

Với những hiểu biết đó, chúng ta hãy xây dựng hook `useSpeech` mạnh mẽ này.

-----

### 1\. 🏗️ Mã nguồn Custom Hook: `hooks/useSpeech.ts`

Đây là trái tim của hệ thống. Hãy tạo file `hooks/useSpeech.ts` (hoặc `.js`).

```typescript
// Bắt buộc phải có "use client" vì hook này dùng API của trình duyệt
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

// Định nghĩa các tùy chọn khi gọi hàm speak
export interface SpeakOptions {
  text: string;
  voice?: SpeechSynthesisVoice; // Giọng đọc cụ thể
  rate?: number;                 // Tốc độ cụ thể
  lang?: string;                 // Ngôn ngữ (ví dụ 'vi-VN' hoặc 'en-GB')
}

// Đây là những gì hook sẽ trả về cho component
export interface UseSpeechReturn {
  // Trạng thái
  isSpeaking: boolean;
  isPaused: boolean;
  
  // Danh sách giọng đọc
  voices: SpeechSynthesisVoice[];
  
  // Hàm điều khiển
  speak: (options: SpeakOptions) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void; // Dừng và xóa hàng đợi (Tua về đầu)
  
  // Cài đặt chung
  setRate: (rate: number) => void;
  currentRate: number;
  setGlobalVoice: (voice: SpeechSynthesisVoice) => void;
  currentGlobalVoice: SpeechSynthesisVoice | null;
  
  // Tính năng thêm
  setSleepTimer: (minutes: number) => void; // Hẹn giờ tắt
}

// Lấy đối tượng synth một cách an toàn
const getSynth = (): SpeechSynthesis | null => {
  return typeof window !== 'undefined' ? window.speechSynthesis : null;
};


export const useSpeech = (defaultRate = 1): UseSpeechReturn => {
  const synth = getSynth();
  
  // State quản lý trạng thái
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // State quản lý cài đặt
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentRate, setRate] = useState(defaultRate);
  const [currentGlobalVoice, setGlobalVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Ref cho bộ hẹn giờ
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- 1. Tải danh sách giọng đọc ---
  const loadVoices = useCallback(() => {
    if (!synth) return;
    const availableVoices = synth.getVoices();
    setVoices(availableVoices);
    
    // Tự động chọn 1 giọng mặc định (ví dụ: en-US)
    if (!currentGlobalVoice) {
      const defaultVoice = availableVoices.find(v => v.lang === 'en-US') || availableVoices[0];
      setGlobalVoice(defaultVoice || null);
    }
  }, [synth, currentGlobalVoice]);

  useEffect(() => {
    if (!synth) return;
    
    loadVoices(); // Tải ngay lập tức
    // Sự kiện 'voiceschanged' là bắt buộc
    synth.addEventListener('voiceschanged', loadVoices);

    return () => {
      synth.removeEventListener('voiceschanged', loadVoices);
    };
  }, [synth, loadVoices]);

  // --- 2. Hàm điều khiển chính ---
  
  const stop = useCallback(() => {
    if (!synth) return;
    synth.cancel(); // Xóa hàng đợi và dừng ngay lập tức
    setIsSpeaking(false);
    setIsPaused(false);
    // Cũng xóa luôn hẹn giờ tắt
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [synth]);

  // Hàm speak sẽ tạo và đưa vào HÀNG ĐỢI
  const speak = useCallback((options: SpeakOptions) => {
    if (!synth) return;
    
    // Nếu đang tạm dừng, nhấn play sẽ tiếp tục thay vì nói câu mới
    if (isPaused) {
      resume();
      return;
    }
    
    const { text, voice, rate, lang } = options;
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Ưu tiên 1: Giọng đọc được truyền vào (options.voice)
    // Ưu tiên 2: Giọng đọc chung đã cài (currentGlobalVoice)
    // Ưu tiên 3: Tìm giọng theo ngôn ngữ (options.lang)
    // Ưu tiên 4: Mặc định của trình duyệt
    if (voice) {
      utterance.voice = voice;
    } else if (currentGlobalVoice) {
      utterance.voice = currentGlobalVoice;
    } else if (lang) {
      const voiceForLang = voices.find(v => v.lang.startsWith(lang));
      if (voiceForLang) utterance.voice = voiceForLang;
    }
    
    utterance.rate = rate || currentRate;

    // Cập nhật state khi bắt đầu và kết thúc
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      // Chỉ set false nếu hàng đợi trống
      if (!synth.pending) {
        setIsSpeaking(false);
        setIsPaused(false);
      }
    };
    
    utterance.onerror = (e) => {
      console.error("SpeechSynthesis Error:", e);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    synth.speak(utterance);
    
  }, [synth, currentRate, currentGlobalVoice, voices, isPaused]);

  const pause = useCallback(() => {
    if (!synth || !isSpeaking) return;
    synth.pause();
    setIsPaused(true);
    setIsSpeaking(false);
  }, [synth, isSpeaking]);

  const resume = useCallback(() => {
    if (!synth || !isPaused) return;
    synth.resume();
    setIsPaused(false);
    setIsSpeaking(true);
  }, [synth, isPaused]);

  // --- 3. Tính năng thêm: Hẹn giờ tắt ---
  const setSleepTimer = useCallback((minutes: number) => {
    // Hủy timer cũ nếu có
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // Nếu minutes = 0, tức là tắt hẹn giờ
    if (minutes > 0) {
      const ms = minutes * 60 * 1000;
      console.log(`Setting sleep timer for ${minutes} minutes.`);
      timerRef.current = setTimeout(() => {
        console.log('Sleep timer triggered. Stopping speech.');
        stop();
      }, ms);
    } else {
      console.log('Sleep timer cancelled.');
    }
  }, [stop]);

  // --- 4. Tính năng thêm: Hotkeys (Phím tắt) ---
  // Chúng ta kích hoạt nó bên trong component thay vì trong hook
  // Nhưng hook có thể cung cấp các hàm để component gọi
  
  // Trả về mọi thứ component cần
  return {
    isSpeaking,
    isPaused,
    voices,
    speak,
    pause,
    resume,
    stop,
    setRate,
    currentRate,
    setGlobalVoice,
    currentGlobalVoice,
    setSleepTimer,
  };
};
```

-----

### 2\. 🖥️ Cách sử dụng Hook trong Component

Bây giờ, component của bạn (ví dụ `components/MyEnglishLesson.tsx`) sẽ trở nên rất gọn gàng.

```typescript
// Bắt buộc phải có "use client"
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSpeech, SpeakOptions } from '@/hooks/useSpeech';

const MyEnglishLesson: React.FC = () => {
  // Chỉ cần gọi hook
  const {
    isSpeaking,
    isPaused,
    voices,
    speak,
    pause,
    resume,
    stop,
    setRate,
    currentRate,
    setGlobalVoice,
    currentGlobalVoice,
    setSleepTimer,
  } = useSpeech(1.0); // Tốc độ mặc định là 1.0

  // State riêng của component
  const [textToRead, setTextToRead] = useState(
    "Hello world. This is a long paragraph for testing the speech synthesis API in a Next.js application."
  );
  
  // Lọc danh sách giọng đọc Anh/Việt
  const englishVoices = useMemo(() => voices.filter(v => v.lang.startsWith('en')), [voices]);
  const vietnameseVoices = useMemo(() => voices.filter(v => v.lang.startsWith('vi')), [voices]);

  // --- Xử lý Phím tắt (Feature 9) ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ví dụ: Ctrl + Space để Play/Pause
      if (event.ctrlKey && event.code === 'Space') {
        event.preventDefault();
        if (isSpeaking) {
          pause();
        } else {
          // Nếu đang tạm dừng thì resume, nếu không thì speak
          if (isPaused) {
            resume();
          } else {
            speak({ text: textToRead });
          }
        }
      }
      
      // Ví dụ: Ctrl + S để Stop
      if (event.ctrlKey && event.code === 'KeyS') {
        event.preventDefault();
        stop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSpeaking, isPaused, textToRead, speak, pause, resume, stop]);


  // --- Render UI ---
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      <h3>Bài đọc</h3>
      <textarea
        value={textToRead}
        onChange={(e) => setTextToRead(e.target.value)}
        rows={5}
        style={{ width: '100%' }}
      />
      
      {/* 1. Điều khiển chính */}
      <h4>Điều khiển (Ctrl+Space, Ctrl+S)</h4>
      <button onClick={() => speak({ text: textToRead })}>
        {isPaused ? 'Tiếp tục' : 'Phát'}
      </button>
      <button onClick={pause} disabled={!isSpeaking}>Tạm dừng</button>
      <button onClick={resume} disabled={!isPaused}>Tiếp tục</button>
      <button onClick={stop}>Dừng (Tua lại)</button>

      {/* 2. Cài đặt chung */}
      <h4>Cài đặt</h4>
      <div>
        <label>Tốc độ: {currentRate.toFixed(1)}x</label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={currentRate}
          onChange={(e) => setRate(parseFloat(e.target.value))}
        />
      </div>

      <div>
        <label>Giọng đọc chung: </label>
        <select
          value={currentGlobalVoice?.name || ''}
          onChange={(e) => {
            const voice = voices.find(v => v.name === e.target.value);
            setGlobalVoice(voice || null);
          }}
        >
          <option value="">-- Tự động --</option>
          {voices.map(v => (
            <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
          ))}
        </select>
      </div>
      
      <div>
        <label>Hẹn giờ tắt (phút, 0 = tắt): </label>
        <input 
          type="number" 
          min="0"
          defaultValue="0"
          onChange={(e) => setSleepTimer(parseInt(e.target.value, 10) || 0)}
        />
      </div>
      
      {/* 3. Đọc các câu/từ riêng lẻ */}
      <h4>Đọc các phần riêng (Feature 4)</h4>
      <p>
        Học từ: <button onClick={() => speak({ text: "Apple", lang: 'en' })}>Apple</button>
      </p>
      <p>
        Giải thích: <button onClick={() => speak({ text: "Quả táo", lang: 'vi' })}>Quả táo</button>
      </p>
      <p>
        Ví dụ: <button onClick={() => speak({ text: "I want to eat an apple.", lang: 'en' })}>I want to eat an apple.</button>
      </p>
      
      {/* 4. Chọn giọng Anh/Việt (Feature 1, 2) */}
      <p>
        Phát âm "Hello" giọng Anh (UK):
        <select onChange={(e) => {
          const voice = voices.find(v => v.name === e.target.value);
          if (voice) speak({ text: "Hello", voice: voice });
        }}>
          {englishVoices.length === 0 ? <option>Không có giọng Anh</option> :
            englishVoices.map(v => <option key={v.name} value={v.name}>{v.name}</option>)
          }
        </select>
      </p>
      
    </div>
  );
};

export default MyEnglishLesson;
```

-----

### 3\. 💡 Tính năng đề xuất (Feature 10)

Kiến trúc hook này mở ra 2 tính năng cực kỳ mạnh mẽ:

1.  **Hàng đợi phát âm (Automatic Queuing):**

      * Bạn có thấy trong ví dụ "Đọc các phần riêng" (Feature 4) không? Nếu bạn bấm "Apple", rồi "Quả táo", rồi "I want to eat an apple" thật nhanh, API sẽ **tự động xếp hàng** (queue) chúng và đọc lần lượt.
      * Đây chính là lý do hàm `speak` của chúng ta không gọi `stop()` (tức là `cancel()`). Nó cho phép bạn xây dựng một chuỗi đọc (ví dụ: đọc từ, dừng 1s, đọc nghĩa, dừng 1s, đọc ví dụ) rất mượt mà.

2.  **Đánh dấu từ đang đọc (Text Highlighting):**

      * Đây là tính năng *giết chết* (killer feature) cho app học tiếng Anh.
      * `SpeechSynthesisUtterance` có một sự kiện là `onboundary`. Sự kiện này kích hoạt khi trình duyệt đọc đến một từ (hoặc câu) mới.
      * Bạn có thể dùng nó để lấy `event.charIndex` (vị trí ký tự) và cập nhật UI, tô vàng từ đang được đọc.
      * **Cách làm:** Mở rộng hook `useSpeech` để nhận thêm một callback `onBoundary` và trả về `currentCharIndex`. Component UI sẽ nhận index này và tô màu phần văn bản tương ứng.

-----

### 4\. Tổng kết (Checklist các yêu cầu)

Hãy xem hook này đã giải quyết các yêu cầu của bạn thế nào:

| Yêu cầu | Giải pháp trong Hook |
| :--- | :--- |
| 1. Giọng Anh | Lọc `voices` theo `en` (ví dụ `en-GB`, `en-US`). *Giới hạn: Phụ thuộc trình duyệt.* |
| 2. Giọng Việt | Lọc `voices` theo `vi` (ví dụ `vi-VN`). *Giới hạn: Phụ thuộc trình duyệt.* |
| 3. Đọc bài dài | `speak({ text: longText })`. *Giới hạn: Giới hạn ký tự của trình duyệt.* |
| 4. Đọc câu/từ | `speak({ text: word, lang: 'en' })`. Tính năng xếp hàng (queue) rất hữu ích ở đây. |
| 5. Nhiều giọng | State `voices` và hàm `setGlobalVoice` hoặc `options.voice` trong `speak()`. |
| 6. Tua | Hàm `stop()` (tức là `synth.cancel()`) sẽ dừng và xóa hàng đợi. Lần `speak()` tiếp theo sẽ bắt đầu lại. |
| 7. Điều khiển tốc độ | State `currentRate` và hàm `setRate()`. |
| 8. Hẹn giờ tắt | Hàm `setSleepTimer()` sử dụng `useRef` và `setTimeout`. |
| 9. Hotkey | `useEffect` trong *Component* (ví dụ) để lắng nghe `keydown` và gọi các hàm ( `pause`, `stop`...) từ hook. |
| 10. Tính năng xịn | **Text Highlighting** (dùng `onboundary`) và **Queuing** (đã tích hợp sẵn). |

Đây là một nền tảng rất vững chắc. Bạn có muốn tôi triển khai thử tính năng số 10 (Text Highlighting) vào hook `useSpeech` không? Nó sẽ làm hook phức tạp hơn một chút nhưng rất đáng giá.

