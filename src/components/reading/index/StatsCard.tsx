"use client";

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export function StatsCard({ icon: Icon, label, value, trend }: {
    icon: any;
    label: string;
    value: string | number;
    trend?: string;
}) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <p className="text-2xl font-bold mt-1">{value}</p>
                        {trend && (
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                <TrendingUp size={12} />
                                {trend}
                            </p>
                        )}
                    </div>
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
