DROP INDEX IF EXISTS idx_hr_department_transition_hc_quota;

ALTER TABLE hr_department
DROP COLUMN IF EXISTS transition_hc_quota;
