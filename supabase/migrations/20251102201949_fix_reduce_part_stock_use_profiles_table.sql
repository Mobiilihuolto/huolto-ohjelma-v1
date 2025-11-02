/*
  # Fix reduce_part_stock Function to Use Correct Table

  1. Problem
    - Previous version referenced non-existent `kayttajat` table
    - Should use `profiles` table which contains user-company mappings
    - Function would fail at runtime due to missing table

  2. Changes
    - Update function to query `profiles` table instead of `kayttajat`
    - Change column names: `yritys_id` -> `company_id`, `kayttaja_id` -> `user_id`
    - Maintain all security validations and company_id checks

  3. Security
    - All company_id validations remain intact
    - Function still runs with INVOKER rights (caller's permissions)
    - RLS policies on profiles table ensure proper access control
*/

-- Drop and recreate the function with correct table reference
DROP FUNCTION IF EXISTS public.reduce_part_stock(uuid, integer);

CREATE OR REPLACE FUNCTION public.reduce_part_stock(
  part_id uuid,
  quantity integer
)
RETURNS json
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_company_id uuid;
  v_user_company_id uuid;
  v_current_stock integer;
  v_part_name text;
BEGIN
  -- Validate input
  IF part_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Part ID is required'
    );
  END IF;

  IF quantity IS NULL OR quantity <= 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Quantity must be greater than zero'
    );
  END IF;

  -- Get the user's company_id from profiles table
  SELECT company_id INTO v_user_company_id
  FROM public.profiles
  WHERE user_id = auth.uid();

  IF v_user_company_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User company not found'
    );
  END IF;

  -- Get the part's company_id and current stock
  SELECT company_id, saldo, nimi
  INTO v_company_id, v_current_stock, v_part_name
  FROM public.varaosat
  WHERE id = part_id
  AND is_active = true;

  IF v_company_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Part not found'
    );
  END IF;

  -- Verify the part belongs to the user's company
  IF v_company_id != v_user_company_id THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Unauthorized: Part does not belong to your company'
    );
  END IF;

  -- Check if we have enough stock
  IF v_current_stock < quantity THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient stock',
      'current_stock', v_current_stock,
      'requested', quantity,
      'part_name', v_part_name
    );
  END IF;

  -- Reduce the stock
  UPDATE public.varaosat
  SET 
    saldo = saldo - quantity,
    updated_at = now()
  WHERE id = part_id
  AND company_id = v_user_company_id
  AND is_active = true;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Failed to update stock'
    );
  END IF;

  -- Return success
  RETURN json_build_object(
    'success', true,
    'message', 'Stock reduced successfully',
    'part_name', v_part_name,
    'quantity_reduced', quantity,
    'new_stock', v_current_stock - quantity
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.reduce_part_stock(uuid, integer) TO authenticated;

-- Add comment explaining the function
COMMENT ON FUNCTION public.reduce_part_stock(uuid, integer) IS 
'Securely reduces inventory part stock when added to service orders. Validates company ownership via profiles table and prevents cross-tenant manipulation.';