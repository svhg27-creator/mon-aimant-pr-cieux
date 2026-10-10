import { BadgeCheck, CreditCard, LockKeyhole, Smartphone } from "lucide-react";

interface PaymentMethodsProps {
  compact?: boolean;
  className?: string;
}

export function PaymentMethods({ compact = false, className = "" }: PaymentMethodsProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {!compact && (
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <LockKeyhole className="h-4 w-4 text-primary" /> Paiement sécurisé
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <PaymentBadge icon={CreditCard} label="Carte bancaire" />
        <PaymentBadge icon={CreditCard} label="Visa" />
        <PaymentBadge icon={CreditCard} label="Mastercard" />
        <PaymentBadge icon={Smartphone} label="Paiement mobile" />
      </div>
      {!compact && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <BadgeCheck className="h-3.5 w-3.5 text-primary" /> Les moyens disponibles sont confirmés au paiement.
        </p>
      )}
    </div>
  );
}

function PaymentBadge({ icon: Icon, label }: { icon: typeof CreditCard; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-border bg-background px-2.5 py-1.5 text-xs text-foreground/80">
      <Icon className="h-3.5 w-3.5 text-primary" /> {label}
    </span>
  );
}
