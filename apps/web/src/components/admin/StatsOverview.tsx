// apps/web/src/components/admin/StatsOverview.tsx
'use client';

export const StatsOverview = () => {
    return (
        <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Stats Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                    <p className="text-muted-foreground text-sm">Total Users</p>
                    <p className="text-2xl font-bold text-white mt-1">---</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                    <p className="text-muted-foreground text-sm">Active Events</p>
                    <p className="text-2xl font-bold text-white mt-1">---</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                    <p className="text-muted-foreground text-sm">Revenue</p>
                    <p className="text-2xl font-bold text-primary mt-1">₹---</p>
                </div>
            </div>
        </div>
    );
};
