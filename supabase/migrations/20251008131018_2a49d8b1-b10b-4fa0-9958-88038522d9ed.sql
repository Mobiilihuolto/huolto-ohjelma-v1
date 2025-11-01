-- Luodaan funktio varaosan saldon vähentämiseen
CREATE OR REPLACE FUNCTION public.reduce_part_stock(
  part_id UUID,
  quantity INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.varaosat
  SET 
    saldo = GREATEST(0, saldo - quantity),
    updated_at = now()
  WHERE id = part_id AND is_active = true;
END;
$$;