
import { Card, CardContent } from "@/components/ui/card";
import { Truck } from "lucide-react";
import React from "react";

interface EmptyStateCardProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
}

export function EmptyStateCard({ icon, title, message }: EmptyStateCardProps) {
  return (
    <Card>
      <CardContent className="text-center py-12">
        {icon || <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
