CREATE TRIGGER IF NOT EXISTS reject_new_todos_on_limit_reach
BEFORE INSERT ON todos
WHEN (SELECT COUNT(id) > 5)
BEGIN
  SELECT RAISE(FAIL, 'Limit of todos is reached');
END;
