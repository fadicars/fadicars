# Korea vehicle records

`korea-cars.json` is the separate Korea inventory.
Add real records only. Never reuse the Mobile.bg inventory file or APIs.
The single frontend entry point is `FadiKorea.load()` in `assets/js/korea-data.js`.
An importer can write this same JSON array, or the loader can later fetch an API.

Each record uses this schema (the types below are documentation, not sample inventory):

| Field | Type / rule |
| --- | --- |
| id | Nonempty string, unique and stable; do not change after publication |
| title | Nonempty string |
| make, model, trim | Strings |
| year | Integer year, or null if unknown |
| mileage | Nonnegative number in kilometres, or null if unknown |
| fuel, engine, power, transmission, drivetrain, color | Strings; power includes units |
| price | Nonnegative number in EUR, or null if unknown; used for filtering |
| priceText | Display string; blank means price on request even when price is supplied |
| status | `available`, `reserved`, `sold`, or `removed` |
| location | String; normally Южна Корея |
| source, sourceUrl | Internal provenance strings; never displayed to customers |
| image | Main image URL or site-relative path; blank is allowed |
| images | Array of image URL/path strings; blank array is allowed |
| features | Array of Bulgarian feature strings |
| description | Bulgarian plain text |
| notes | Internal plain text; never displayed to customers |
| titleEn, descriptionEn | Optional English plain text |
| featuresEn | Optional array of English feature strings |
| fuelEn, engineEn, powerEn, transmissionEn, drivetrainEn, colorEn, locationEn | Optional English strings for values not covered by the existing translation dictionary |

Use empty strings/arrays and null numbers for unknown values. No HTML is accepted;
customer content is inserted as text. Images may use HTTP(S) or site-relative
paths; other protocols are rejected. Failed images become neutral placeholders.
Ensure image hosting permits public access and choose stable URLs.

Both available and reserved records are visible; reserved records have a badge.
Sold, removed, unknown-status, missing-ID/title, and duplicate-ID records are
excluded. Detail and enquiry selection use the same visibility rules. Price
filters exclude unknown numeric prices. Titles identify each record to customers.

For complete English content, supply descriptionEn and featuresEn along with
any unfamiliar specification translations. Without English free-text fields,
the English detail view offers further information on request rather than
displaying Bulgarian prose. All interface labels are translated separately.

Routes: `/korea-cars`, `/korea-car?id=<id>`, and
`/korea?car=<id>#korea-enquiry`. The source URL and internal notes are not
included in the customer enquiry; a public FADI detail link is prefilled instead.

Local Next Auto import (Node.js 18+; uses the existing Cheerio dependency):

```sh
node scripts/add-korea-car.js "https://www.nextauto.bg/cars-order/1245713" 16999
node scripts/add-korea-car.js "https://www.nextauto.bg/cars-order/1245713" 16999 --preview
```

The second argument is the FADI selling price in EUR, using a decimal point if
needed. The source price is never used as the selling price. The tool fetches
only the initial HTML, previews the record, rejects duplicates by stable ID or
normalized source URL, then atomically appends one record. Missing specifications
remain empty. Internal source identifiers go in notes and are not verified VINs.
The generated description contains extracted facts, without Next Auto sales copy.
Imported equipment remains in Bulgarian; optional English fields can be added
manually using the schema above.

The importer is a tracked project maintenance tool run locally through Node.js,
not an API or frontend entry point. Vercel configuration is unchanged.
If an interrupted process leaves `korea-cars.json.lock`, verify no
import process is running before removing that lock and retrying.
