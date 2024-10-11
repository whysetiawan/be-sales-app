-- 1st
SELECT * FROM public.employee e;

-- 2nd
SELECT count(id) AS "total_manager" FROM public.employees e 
  WHERE e.job_title = 'Manager';

-- 3rd
SELECT e.name, e.salary FROM employees e 
	WHERE department = 'Sales' OR department = 'Marketing'
  
-- alternative 3rd
SELECT name, salary FROM employees e WHERE e.department IN ('Sales', 'Marketing');

-- 4th
SELECT avg(salary) FROM public.employees e
  WHERE e.joined_at >= now() - INTERVAL '5 years';

-- 5th
SELECT e.id, e.name, sum(s.sales) AS total_sales FROM public.employees e
  JOIN public.sales s ON e.id = s."employeeId"
  GROUP BY e.id, e.name
  ORDER BY total_sales DESC
  LIMIT 5;

-- 7th
SELECT sum(s.sales) as total_sales, RANK() OVER(ORDER BY total_sales DESC) AS rank, e.name FROM employees e
	JOIN sales s ON s."employeeId" = e.id
	GROUP BY e."name"
	ORDER BY total_sales DESC;

-- alternative 7th
WITH sales_data AS (
    SELECT 
        e.name, 
        SUM(s.sales) AS total_sales
    FROM 
        employees e
    JOIN 
        sales s ON s."employeeId" = e.id
    GROUP BY 
        e.name
)
SELECT 
    total_sales, 
    RANK() OVER (ORDER BY total_sales DESC) AS rank, 
    name
FROM 
    sales_data;