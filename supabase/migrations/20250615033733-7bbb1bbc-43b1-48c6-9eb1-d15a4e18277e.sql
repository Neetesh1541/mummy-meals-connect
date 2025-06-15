
-- Create chat_messages table
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX ON public.chat_messages (order_id);
CREATE INDEX ON public.chat_messages (sender_id);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Helper function to check if a user is part of an order
CREATE OR REPLACE FUNCTION is_part_of_order(p_order_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.orders
    WHERE id = p_order_id
      AND (
        customer_id = p_user_id
        OR mom_id = p_user_id
        OR delivery_partner_id = p_user_id
      )
  );
$$;

-- Policy: Allow users who are part of an order to view messages for that order
CREATE POLICY "Allow select for order participants"
ON public.chat_messages
FOR SELECT
USING (is_part_of_order(order_id, auth.uid()));

-- Policy: Allow users who are part of an order to send messages for that order
CREATE POLICY "Allow insert for order participants"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  is_part_of_order(order_id, auth.uid())
);
