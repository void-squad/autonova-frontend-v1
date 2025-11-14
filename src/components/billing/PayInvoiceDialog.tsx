import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Elements, CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, Stripe, StripeCardElementOptions, StripeElementsOptions } from '@stripe/stripe-js';
import { Loader2, ShieldCheck } from 'lucide-react';
import { BillingInvoice } from '@/types';
import { createPaymentIntent, getInvoice } from '@/services/billingService';
import { PaymentIntentResponse } from '@/types/billing';
import { formatInvoiceAmount } from './invoice-utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { invoiceKeys } from '@/hooks/use-invoices';

interface PayInvoiceDialogProps {
  invoice: BillingInvoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentCompleted?: (invoice: BillingInvoice) => void;
}

type PaymentPhase = 'idle' | 'processing' | 'confirming' | 'succeeded' | 'errored';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const PayInvoiceDialog = ({ invoice, open, onOpenChange, onPaymentCompleted }: PayInvoiceDialogProps) => {
  const [intentResponse, setIntentResponse] = useState<PaymentIntentResponse | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [intentError, setIntentError] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [intentNonce, setIntentNonce] = useState(0);
  const { toast } = useToast();
  const invoiceId = invoice?.id;
  const [lastVerifiedInvoice, setLastVerifiedInvoice] = useState<BillingInvoice | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const handleVerifyingChange = useCallback((next: boolean) => setIsVerifying(next), []);

  const resetState = useCallback(() => {
    setIntentResponse(null);
    setStripePromise(null);
    setIntentError(null);
    setLoadingIntent(false);
    setIntentNonce(0);
    setLastVerifiedInvoice(null);
    setIsVerifying(false);
  }, []);

  useEffect(() => {
    if (!open) {
      resetState();
      return;
    }
    if (!invoiceId || invoice?.status !== 'OPEN') {
      return;
    }

    let cancelled = false;
    setLoadingIntent(true);
    setIntentError(null);
    setIntentResponse(null);
    setLastVerifiedInvoice(null);

    createPaymentIntent(invoiceId)
      .then((response) => {
        if (cancelled) return;
        setIntentResponse(response);
        setStripePromise(loadStripe(response.publishableKey));
      })
      .catch((error) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : 'Failed to initialize payment.';
        setIntentError(message);
        toast({
          variant: 'destructive',
          title: 'Unable to start payment',
          description: message,
        });
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingIntent(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, invoiceId, invoice?.status, intentNonce, resetState, toast]);

  useEffect(() => {
    if (!open || !invoiceId || invoice?.status === 'OPEN') {
      return;
    }
    if (!intentResponse) {
      setIntentError('This invoice is no longer open for payment.');
    }
  }, [open, invoiceId, invoice?.status, intentResponse]);

  const elementsOptions = useMemo<StripeElementsOptions | undefined>(() => {
    if (!intentResponse) return undefined;
    return {
      clientSecret: intentResponse.clientSecret,
      appearance: {
        theme: 'stripe',
      },
    };
  }, [intentResponse]);

  const handleRetry = () => {
    setIntentNonce((count) => count + 1);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isVerifying) {
      toast({
        title: 'Confirming payment',
        description: 'Please keep this window open while we finish updating your invoice.',
      });
      return;
    }
    onOpenChange(nextOpen);
    if (!nextOpen) {
      resetState();
    }
  };

  const invoiceSummary = lastVerifiedInvoice ?? invoice;
  const formInvoice = invoice ?? lastVerifiedInvoice;
  const shouldRenderForm =
    !loadingIntent && !intentError && !!intentResponse && !!stripePromise && !!formInvoice;
  const allowRetry = !invoice || invoice.status === 'OPEN';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Pay invoice</DialogTitle>
          <DialogDescription>Card payments are securely handled by Stripe.</DialogDescription>
        </DialogHeader>
        {isVerifying && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Waiting for confirmation</AlertTitle>
            <AlertDescription>
              We accepted your card payment. Please keep this window open while we update your invoice status.
            </AlertDescription>
          </Alert>
        )}
        {invoiceSummary ? (
          <div className="space-y-4">
            <div className="rounded-md border bg-muted/40 px-4 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Invoice</span>
                <span className="font-medium">{invoiceSummary.projectName ?? invoiceSummary.id.slice(0, 8)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-muted-foreground">Amount due</span>
                <span className="text-lg font-semibold">
                  {formatInvoiceAmount(invoiceSummary.amountTotal, invoiceSummary.currency)}
                </span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Invoice ID: {invoiceSummary.id}
              </div>
            </div>

            {intentError && (
              <Alert variant="destructive">
                <AlertTitle>Unable to start payment</AlertTitle>
                <AlertDescription>{intentError}</AlertDescription>
              </Alert>
            )}

            {loadingIntent && (
              <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting to Stripe…
              </div>
            )}

            {shouldRenderForm && formInvoice && (
              <Elements key={intentResponse.clientSecret} stripe={stripePromise} options={elementsOptions}>
                <PayInvoiceForm
                  invoice={formInvoice}
                  clientSecret={intentResponse.clientSecret}
                  paymentIntentId={intentResponse.paymentIntentId}
                  onPaymentCompleted={(updatedInvoice) => {
                    setLastVerifiedInvoice(updatedInvoice);
                    onPaymentCompleted?.(updatedInvoice);
                    handleOpenChange(false);
                  }}
                  onVerifyingChange={handleVerifyingChange}
                />
              </Elements>
            )}

            {intentResponse && (
              <p className="text-xs text-muted-foreground">
                Stripe reference: <span className="font-mono">{intentResponse.paymentIntentId}</span>
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Select an open invoice to start payment.</p>
        )}
        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          {intentError && allowRetry && (
            <Button variant="outline" onClick={handleRetry} disabled={loadingIntent}>
              Retry
            </Button>
          )}
          <Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={isVerifying}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface PayInvoiceFormProps {
  invoice: BillingInvoice;
  clientSecret: string;
  paymentIntentId: string;
  onPaymentCompleted: (invoice: BillingInvoice) => void;
  onVerifyingChange: (verifying: boolean) => void;
}

const PayInvoiceForm = ({
  invoice,
  clientSecret,
  paymentIntentId,
  onPaymentCompleted,
  onVerifyingChange,
}: PayInvoiceFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardComplete, setCardComplete] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [cardError, setCardError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [phase, setPhase] = useState<PaymentPhase>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);


  const cardOptions: StripeCardElementOptions = useMemo(
    () => ({
      hidePostalCode: true,
      style: {
        base: {
          fontSize: '16px',
          color: 'hsl(var(--foreground))',
          '::placeholder': {
            color: 'hsl(var(--muted-foreground))',
          },
        },
        invalid: {
          color: 'hsl(var(--destructive))',
        },
      },
    }),
    []
  );

  const pollInvoiceStatus = useCallback(async (): Promise<BillingInvoice> => {
    const maxAttempts = 12;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        const latest = await getInvoice(invoice.id);
        if (latest.status === 'PAID') {
          return latest;
        }
      } catch {
        // keep retrying silently to avoid spamming the user
      }
      await delay(2_000);
    }
    throw new Error('Payment submitted but still awaiting confirmation from our billing system.');
  }, [invoice.id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements) {
      setFormError('Payment form is still initializing. Please wait a moment and try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setFormError('Card input is not ready yet. Please reload the modal.');
      return;
    }

    setFormError(null);
    setPhase('processing');
    setIsSubmitting(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardholderName || undefined,
            email: user?.email,
          },
        },
      });

      if (error) {
        throw new Error(error.message ?? 'Payment was declined. Check your card details and try again.');
      }

      if (!paymentIntent) {
        throw new Error('Payment could not be completed. No response from Stripe.');
      }

      if (paymentIntent.status !== 'succeeded' && paymentIntent.status !== 'processing') {
        throw new Error(`Payment returned status "${paymentIntent.status ?? 'unknown'}". Please try again.`);
      }

      if (!mountedRef.current) return;
      setPhase('confirming');
      toast({
        title: 'Payment submitted',
        description: `Waiting for ${invoice.projectName ?? 'invoice'} to be confirmed by our billing system…`,
      });
      onVerifyingChange(true);

      const updatedInvoice = await pollInvoiceStatus();
      if (!mountedRef.current) return;

      setPhase('succeeded');
      onVerifyingChange(false);
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      onPaymentCompleted(updatedInvoice);
      toast({
        title: 'Payment confirmed',
        description: `${invoice.projectName ?? 'Invoice'} is now marked as paid.`,
      });
    } catch (error) {
      if (!mountedRef.current) return;
      const message =
        error instanceof Error ? error.message : 'Something went wrong while processing your payment. Please try again.';
      setFormError(message);
      setPhase('errored');
      onVerifyingChange(false);
      toast({
        variant: 'destructive',
        title: 'Unable to process payment',
        description: message,
      });
    } finally {
      if (mountedRef.current) {
        setIsSubmitting(false);
      }
    }
  };
  const showSubmitButton = phase !== 'succeeded' && phase !== 'confirming';
  const disableSubmit = !stripe || !elements || !cardComplete || isSubmitting;
  const formLocked = phase === 'processing' || phase === 'confirming';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cardholder-name">Name on card</Label>
        <Input
          id="cardholder-name"
          placeholder="Jane Doe"
          value={cardholderName}
          onChange={(event) => setCardholderName(event.target.value)}
          disabled={formLocked}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Card details</Label>
        <div className={`rounded-md border bg-background px-3 py-2 ${formLocked ? 'pointer-events-none opacity-70' : ''}`}>
          <CardElement
            options={cardOptions}
            onChange={(event) => {
              setCardComplete(event.complete);
              setCardError(event.error?.message ?? null);
            }}
          />
        </div>
        {cardError && (
          <p className="text-xs text-destructive" role="alert">
            {cardError}
          </p>
        )}
      </div>

      {formError && (
        <Alert variant="destructive">
          <AlertTitle>Payment error</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      {phase === 'confirming' && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Finalizing payment</AlertTitle>
          <AlertDescription>
            We received your payment (<span className="font-mono">{paymentIntentId}</span>). Waiting for confirmation…
          </AlertDescription>
        </Alert>
      )}

      {phase === 'succeeded' && (
        <Alert>
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>Payment received</AlertTitle>
          <AlertDescription>
            Stripe accepted the payment (<span className="font-mono">{paymentIntentId}</span>). Your invoice will update
            momentarily.
          </AlertDescription>
        </Alert>
      )}

      {showSubmitButton && (
        <Button type="submit" className="w-full" disabled={disableSubmit}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing payment…
            </>
          ) : (
            <>Pay {formatInvoiceAmount(invoice.amountTotal, invoice.currency)}</>
          )}
        </Button>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Secured by Stripe. Your card details never touch our servers.
      </p>
    </form>
  );
};
