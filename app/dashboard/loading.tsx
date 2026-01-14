import { Card } from "@/components/ui/Card";

export default function DashboardLoading() {
    return (
        <div className="p-4 md:p-8 space-y-8 animate-pulse">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                    <div className="h-8 w-64 bg-navy-light rounded-lg" />
                    <div className="h-4 w-48 bg-navy-light/60 rounded-md" />
                </div>
                <div className="h-12 w-32 bg-gold/20 rounded-xl" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="h-32 bg-navy-light/40 border-gold/5">
                        <div />
                    </Card>
                ))}
            </div>

            <div className="space-y-6">
                <div className="h-6 w-40 bg-navy-light rounded-md" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="h-64 bg-navy-light/20 rounded-2xl border border-white/5" />
                    <div className="h-64 bg-navy-light/20 rounded-2xl border border-white/5" />
                </div>
            </div>
        </div>
    );
}
