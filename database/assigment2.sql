INSERT INTO public.account (
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )
VALUES (
        'Tony',
        'Stark',
        'tony@starkent.com',
        'Iam1ronM@n'
    );
UPDATE public.account
SET account_type = 'Admin'
WHERE account_firstname = 'Tony'
    AND account_lastname = 'Stark';
DELETE FROM public.account
WHERE account_firstname = 'Tony'
    AND account_lastname = 'Stark';
---4---
UPDATE public.inventory
SET inv_description = REPLACE(
        inv_description,
        'small interiors',
        'a huge interior'
    )
WHERE inv_make = 'GM'
    AND inv_model = 'Hummer';
-------
SELECT inv.inv_make,
    inv.inv_model,
    cls.classification_name
FROM public.inventory inv
    INNER JOIN public.classification cls ON inv.classification_id = cls.classification_id
WHERE cls.classification_name = 'Sport';
---6---
UPDATE public.inventory
SET inv_image = CONCAT('/images/vehicles/', inv_image),
    inv_thumbnail = CONCAT('/images/vehicles/', inv_thumbnail)
WHERE inv_image LIKE '%images/%'
    AND inv_thumbnail LIKE '%images/%';
-------