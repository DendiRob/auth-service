USE `YOUR_DB`;

-- скрипт добавляет триггер для обновления поля updated_at везде, где есть такое поле
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN
        SELECT table_name
        FROM information_schema.columns
        WHERE column_name = 'updated_at'
          AND table_schema = 'public'
    LOOP
        EXECUTE format(
            'CREATE TRIGGER before_update_%s
            BEFORE UPDATE ON public."%s"
            FOR EACH ROW
            EXECUTE FUNCTION set_updated_at();',
            tbl.table_name, tbl.table_name
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;