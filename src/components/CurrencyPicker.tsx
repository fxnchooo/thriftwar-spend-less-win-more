import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CURRENCIES, getCurrencySymbol } from "@/hooks/useCurrency";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

interface CurrencyPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CurrencyPicker = ({ open, onOpenChange }: CurrencyPickerProps) => {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  const handleSelect = (code: string) => {
    updateProfile.mutate(
      { preferred_currency: code },
      {
        onSuccess: () => {
          toast.success(`Currency set to ${code} ${getCurrencySymbol(code)}`);
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-auto max-w-md rounded-3xl border-none bg-card p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">Choose Currency</DialogTitle>
        </DialogHeader>
        <div className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => handleSelect(c.code)}
              className={`flex items-center gap-2 rounded-xl p-3 text-left text-sm font-medium transition-all ${
                profile?.preferred_currency === c.code
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              <span className="text-lg font-bold">{c.symbol}</span>
              <div>
                <p className="font-semibold">{c.code}</p>
                <p className="text-xs opacity-70">{c.name}</p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CurrencyPicker;
