
-- Create the cart table to store items added by customers.
CREATE TABLE public.cart (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    menu_id UUID NOT NULL REFERENCES public.menu(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    UNIQUE (customer_id, menu_id)
);

-- Add comments to the table and columns for clarity.
COMMENT ON TABLE public.cart IS 'Shopping cart for users to add menu items before checkout.';
COMMENT ON COLUMN public.cart.id IS 'Unique identifier for each cart item.';
COMMENT ON COLUMN public.cart.created_at IS 'Timestamp of when the item was added to the cart.';
COMMENT ON COLUMN public.cart.customer_id IS 'ID of the customer who owns the cart item.';
COMMENT ON COLUMN public.cart.menu_id IS 'ID of the menu item in the cart.';
COMMENT ON COLUMN public.cart.quantity IS 'Quantity of the menu item.';

-- Enable Row Level Security (RLS) on the cart table.
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

-- Create policies to control access to cart data.
-- 1. Allow users to view their own cart items.
CREATE POLICY "Users can view their own cart items"
ON public.cart
FOR SELECT
USING (auth.uid() = customer_id);

-- 2. Allow users to add items to their own cart.
CREATE POLICY "Users can insert items into their own cart"
ON public.cart
FOR INSERT
WITH CHECK (auth.uid() = customer_id);

-- 3. Allow users to update items in their own cart.
CREATE POLICY "Users can update their own cart items"
ON public.cart
FOR UPDATE
USING (auth.uid() = customer_id);

-- 4. Allow users to delete items from their own cart.
CREATE POLICY "Users can delete their own cart items"
ON public.cart
FOR DELETE
USING (auth.uid() = customer_id);
