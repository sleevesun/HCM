ALTER TABLE hr_department
ADD COLUMN IF NOT EXISTS transition_hc_quota INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_hr_department_transition_hc_quota
ON hr_department (transition_hc_quota);

UPDATE hr_department
SET transition_hc_quota = CEIL(COALESCE(headcount, 0) * 0.025);
