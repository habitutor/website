ALTER TABLE "dashboard_live_class"
	ALTER COLUMN "date" TYPE date
	USING (
		CASE
			WHEN "date" ~ '^\d{4}-\d{2}-\d{2}$' THEN "date"::date
			WHEN "date" ~ '^\d{2}-\d{2}-\d{4}$' THEN to_date("date", 'DD-MM-YYYY')
			ELSE CURRENT_DATE
		END
	);

ALTER TABLE "dashboard_live_class"
	ALTER COLUMN "time" TYPE time
	USING (
		CASE
			WHEN "time" ~ '^\d{2}:\d{2}(:\d{2})?$' THEN "time"::time
			ELSE '00:00'::time
		END
	);
