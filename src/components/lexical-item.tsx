import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BookText, FlipHorizontal, Spline, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PhoneticZoom } from "./phonetic-zoom";

interface LexicalItemProps {
  item: {
    targetLexeme: string;
    phase2Annotation: {
      phonetic?: string;
      sentiment?: "positive" | "negative" | "neutral";
      definitionEN: string;
      translationVI: string;
      relatedCollocates?: string[];
      wordForms?: any;
    };
  };
  children: React.ReactNode;
  hideTranslation?: boolean;
}

export function LexicalItem({ item, children, hideTranslation = false }: LexicalItemProps) {
  const {
    targetLexeme,
    phase2Annotation: {
      phonetic,
      sentiment,
      definitionEN,
      translationVI,
      relatedCollocates,
      wordForms,
    },
  } = item;

  const formattedTranslation =
    translationVI.charAt(0).toLowerCase() + translationVI.slice(1);

  const sentimentClass = {
    positive: "bg-highlight-positive text-highlight-positive-foreground",
    negative: "bg-highlight-negative text-highlight-negative-foreground",
    neutral: "underline decoration-dotted", // No background for neutral, just underline
  }[sentiment || "neutral"];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <span
          className={cn(
            "underline decoration-dotted cursor-pointer",
            sentimentClass
          )}
        >
          <strong>{children}</strong>{" "}
          {!hideTranslation && (
            <em className="text-muted-foreground">({formattedTranslation})</em>
          )}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-full max-w-sm md:max-w-md lg:max-w-lg shadow-xl rounded-xl border-none bg-background p-0">
        <div className="p-5">
          <h4 className="font-bold text-2xl text-foreground">{targetLexeme}</h4>
          {phonetic && (
            <div className="my-2">
              <PhoneticZoom
                text={phonetic}
                className="text-sm italic text-muted-foreground"
              />
            </div>
          )}

          <p className="text-lg text-primary">{formattedTranslation}</p>
        </div>

        <div className="px-5 pb-5 space-y-5">
          <div className="flex items-start space-x-3">
            <BookText className="h-5 w-5 text-muted-foreground mt-1" />
            <p className="flex-1 text-base text-foreground">{definitionEN}</p>
          </div>

          {relatedCollocates && relatedCollocates.length > 0 && (
            <div className="flex items-start space-x-3">
              <Spline className="h-5 w-5 text-muted-foreground mt-1" />
              <div className="flex-1">
                <h5 className="font-semibold text-foreground">Collocates:</h5>
                <div className="flex flex-wrap gap-2 mt-2">
                  {relatedCollocates.map((collocate, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-sm"
                    >
                      {collocate}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {wordForms && (
            <div className="flex items-start space-x-3">
              <Wand2 className="h-5 w-5 text-muted-foreground mt-1" />
              <div className="flex-1">
                <h5 className="font-semibold text-foreground">Word Forms:</h5>
                <div className="mt-2">
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(wordForms).map(
                        ([type, forms]) =>
                          forms &&
                          (forms as any[]).length > 0 &&
                          ((
                            <tr key={type} className="border-b border-muted/50">
                              <td className="py-2 font-medium text-foreground capitalize">
                                {type}
                              </td>
                              <td className="py-2 text-muted-foreground">
                                {(forms as any[])
                                  .map(
                                    (form) => `${form.form} (${form.meaning})`
                                  )
                                  .join(", ")}
                              </td>
                            </tr>
                          ) as any)
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
