# form-generator.changeyourname.mn
A website that automatically generates the forms required to change your name in Minnesota

Simply enter your information into the website and click the links to generate your forms.

-----

# Installation

This project requires [pdf-fill-form](https://www.npmjs.com/package/pdf-fill-form). Windows is not supported. First, install dependencies.

`sudo apt-get install libcairo2-dev libpoppler-qt5-dev poppler-data`

`npm i`

Then you can run the server

`node index.js`

or use pm2 to keep it alive

`pm2 start index.js`

# Usage

By default, the server will run on port `:4747`. It will serve static HTML and handle PDF POST requests as defined by the manifest. If you're running multiple websites on the server, you can use nginx to proxy this to port 80/443 like so.

```
server {
    server_name form-generator.changeyourname.mn www.form-generator.changeyourname.mn;

    root /var/www/form-generator.changeyourname.mn;
    index index.html;

    location / {
        proxy_pass http://localhost:4747;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/form-generator.changeyourname.mn/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/form-generator.changeyourname.mn/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    listen 80;
    server_name form-generator.changeyourname.mn www.form-generator.changeyourname.mn;
    return 301 https://$host$request_uri;

}
```

# Editing or Adding New Forms

Heres a brief overview of how pdf.js functions.

First we define our input as a key-value store

```Javascript
{
    currentFirstName: "John",
    currentMiddleName: "A",
    currentLastName: "Doe",
    newFirstName: "Jane",
    newMiddleName: "B",
    newLastName: "Smith",
    dateOfBirth: "1990-01-01",
    race: "White",
    sexOnBirthRecords: "Male",
    newSex: "Female",
    address: "123 Main St",
    city: "Minneapolis",
    state: "Minnesota",
    zip: "12345",
    county: "Hennepin",
    phone: "123-456-7890",
    email: "asd@example.com",
    legallyBindingSignature: "John Doe"
}

```

Then we define a manifest of PDF files containing their fields and a function describing how to fill out those fields given the input.
```Javascript
const manifest = [

    {
        // the file we read from
        name: '/path/to/file.pdf',
        // a list of fields contained in the PDF
        fields: {
            fullName: TYPES.TEXT,
            address: TYPES.TEXT,
            hasChildren: TYPES.CHECKBOX
        },
        // a function that maps the input from website to fields
        build: (data) => {
            fullName: data.firstName + ' ' data.lastName,
            address: data.address,
            hasChildren: data.children > 0
        }
    }

]



```

On startup, the server will validate all PDFs in the manifest. This includes checking the fields against the manifest and checking the build function for errors. This will catch most simple configuration errors during testing.

-------

How do I add or edit a form?

https://streamable.com/3zor3u

**Add Forms to the PDf using LibreOffice Draw**

You could do this in Acrobat, but Adobe can [removed for professionalism]

Download and install LibreOffice Draw

Open the PDF you wish to edit

View > Toolbars > Form Controls

View > Toolbars > Form Design

Ensure Design mode is turned on (icon of a measuring square)

Click Text Box or Checkbox and place it into the document

Give the field a name: Right Click > Control Properties > Name

Repeat for all fields

File > Export as > Export as PDF

Make sure "create PDF form" is checked

**Add PDF to manifest**

Create a new manifest entry using the existing code as an example. The validator should help you with any simple misconfigurations.

**pdf.js will automatically start serving content based on the manifest**