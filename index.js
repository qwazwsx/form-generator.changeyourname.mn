var express = require("express")
const app = express();
const bodyParser = require('body-parser')
const pdfFillForm = require('pdf-fill-form');

app.use(bodyParser.urlencoded())

// serve static content
app.use(express.static('.'));

app.listen(4747, () => { // 4747 is a reference to the date Sara Millerey González was murdered
    console.log(`Listening on port 4747. View: http://localhost:4747`);
    validateManifest();
});

const TYPES = { TEXT: 'text', CHECKBOX: 'checkbox' }
const manifest = [
    {
        name: 'NAM107_Proposed_Order_Granting_Name_Change.pdf',
        fields: {
            name: TYPES.TEXT,
            newName: TYPES.TEXT,
            fullAddress: TYPES.TEXT,
            county: TYPES.TEXT,
            nameAndDob: TYPES.TEXT,
            noSpouse: TYPES.CHECKBOX,
            noChildren: TYPES.CHECKBOX,
            doNameChange: TYPES.CHECKBOX,
            newName1: TYPES.TEXT,
            doBirthRecordChange: TYPES.CHECKBOX,
            newName2: TYPES.TEXT,
            doSexChange: TYPES.CHECKBOX,
            newSex: TYPES.TEXT,
            doConfidential: TYPES.CHECKBOX,
            doConfidentialName: TYPES.CHECKBOX,
            doConfidentialSex: TYPES.CHECKBOX
        },
        build: (data) => {
            return {
                "name": `${data.currentFirstName} ${data.currentMiddleName} ${data.currentLastName}`,
                "newName": `${data.newFirstName} ${data.newMiddleName} ${data.newLastName}`,
                "fullAddress": `${data.address}, ${data.city}, ${data.state} ${data.zip}`,
                "county": data.county,
                "nameAndDob": `${data.currentFirstName} ${data.currentMiddleName} ${data.currentLastName} (${data.dateOfBirth})`,
                "noSpouse": true,
                "noChildren": true,
                "doNameChange": true,
                "newName1": `${data.newFirstName} ${data.newMiddleName} ${data.newLastName}`,
                "doBirthRecordChange": true,
                "newName2": `${data.newFirstName} ${data.newMiddleName} ${data.newLastName}`,
                "doSexChange": true,
                "newSex": data.newSex,
                "doConfidential": true,
                "doConfidentialName": true,
                "doConfidentialSex": true
            }
        }
    },
    {
        name: 'NAM103_Criminal_History_Check_Release.pdf',
        fields: {
            name: TYPES.TEXT,
            nickname: TYPES.TEXT,
            dob: TYPES.TEXT,
            isF: TYPES.CHECKBOX,
            isM: TYPES.CHECKBOX,
            race: TYPES.TEXT,
            signature: TYPES.TEXT
        },
        build: (data) => {
            return {
                "name": `${data.currentFirstName} ${data.currentMiddleName} ${data.currentLastName}`,
                "nickname": `${data.newFirstName} ${data.newMiddleName} ${data.newLastName}`,
                "dob": data.dateOfBirth,
                "isF": data.sexOnBirthRecords.toLowerCase().indexOf('female') !== -1,
                "isM": data.sexOnBirthRecords.toLowerCase().indexOf('female') === -1,
                "race": data.race,
                "signature": data.legallyBindingSignature
            }
        }
    },
    {
        name: "NAM102_Application_for_Name_Change.pdf",
        fields: {
            fullname: TYPES.TEXT,
            address: TYPES.TEXT,
            citystatezip: TYPES.TEXT,
            county: TYPES.TEXT,
            first: TYPES.TEXT,
            middle: TYPES.TEXT,
            last: TYPES.TEXT,
            dob: TYPES.TEXT,
            doSkipSpouse: TYPES.CHECKBOX,
            doSkipChildren: TYPES.CHECKBOX,
            doSkipChildren1: TYPES.CHECKBOX,
            doNameChange: TYPES.CHECKBOX,
            first1: TYPES.TEXT,
            middle1: TYPES.TEXT,
            last1: TYPES.TEXT,
            newfirst: TYPES.TEXT,
            newmiddle: TYPES.TEXT,
            newlast: TYPES.TEXT,
            doBirthRecordChange: TYPES.CHECKBOX,
            newfirst1: TYPES.TEXT,
            newmiddle1: TYPES.TEXT,
            newlast1: TYPES.TEXT,
            doSexChange: TYPES.CHECKBOX,
            newsex: TYPES.TEXT,
            oldsex: TYPES.TEXT,
            doPrivate: TYPES.CHECKBOX,
            doPrivateName: TYPES.CHECKBOX,
            doPrivateSex: TYPES.CHECKBOX,
            hasNoCriminalHistory: TYPES.CHECKBOX,
            hasNoLand: TYPES.CHECKBOX,
            date: TYPES.TEXT,
            fullname1: TYPES.TEXT,
            signature: TYPES.TEXT,
            address1: TYPES.TEXT,
            countyandstate: TYPES.TEXT,
            citystatezip1: TYPES.TEXT,
            phone: TYPES.TEXT,
            email: TYPES.TEXT,
        },
        build: (data) => {
            return {
                "fullname": `${data.currentFirstName} ${data.currentMiddleName} ${data.currentLastName}`,
                "address": data.address,
                "citystatezip": `${data.city}, ${data.state} ${data.zip}`,
                "county": data.county,
                "first": data.currentFirstName,
                "middle": data.currentMiddleName,
                "last": data.currentLastName,
                "dob": data.dateOfBirth,
                "doSkipSpouse": true,
                "doSkipChildren": true,
                "doSkipChildren1": true,
                "doNameChange": true,
                "first1": data.currentFirstName,
                "middle1": data.currentMiddleName,
                "last1": data.currentLastName,
                "newfirst": data.newFirstName,
                "newmiddle": data.newMiddleName,
                "newlast": data.newLastName,
                "doBirthRecordChange": true,
                "newfirst1": data.newFirstName,
                "newmiddle1": data.newMiddleName,
                "newlast1": data.newLastName,
                "doSexChange": true,
                "newsex": data.newSex,
                "oldsex": data.sexOnBirthRecords,
                "doPrivate": true,
                "doPrivateName": true,
                "doPrivateSex": true,
                "hasNoCriminalHistory": true,
                "hasNoLand": true,
                "date": formatDate(new Date()),
                "fullname1": `${data.newfirstName} ${data.newMiddleName} ${data.newLastName} (${data.currentFirstName} ${data.currentMiddleName} ${data.currentLastName})`,
                "signature": data.legallyBindingSignature,
                "address1": data.address,
                "countyandstate": `${data.county}, ${data.state}`,
                "citystatezip1": `${data.city}, ${data.state} ${data.zip}`,
                "phone": data.phone,
                "email": data.email,
            }
        }
    }
]

// to make debugging easier: we validate that
// 1) each PDF in the manifest has all of the fields that have been specified
// 2) each field in the PDF matches the type specified in the manifest
// 3) the build function for each PDF returns all of the fields specified in the manifest
function validateManifest() {
    console.log("Validating PDFs...");
    manifest.forEach((item) => {
        pdfFillForm.read(item.name).then((result) => {
            let foundFields = {}
            // for each field in the PDF, add it to the foundFields object
            result.forEach((field) => {
                foundFields[field.name] = field.type
            })

            // for each field in the manifest, check if it exists in the PDF
            Object.keys(item.fields).forEach((fieldName) => {
                // if the field is not in the PDF, throw an error
                if (foundFields[fieldName] === undefined) {
                    throw new Error(`[Fatal] Specified field '${fieldName}' not found in PDF for ${item.name}`);
                }
                // if the field is in the PDF, check if the type matches, if it does not, throw an error
                if (foundFields[fieldName] !== item.fields[fieldName]) {
                    throw new Error(`[Fatal] Field '${fieldName}' in PDF for ${item.name} is of type ${foundFields[fieldName]} but expected ${item.fields[fieldName]}`);
                }
            })

            // build using some sample data
            let fields = item.build({
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
            })

            // for each field in the manifest, check if it exists in the built fields
            // that is -- make sure the build function provided all the fields given the test input
            Object.keys(item.fields).forEach((fieldName) => {
                if (fields[fieldName] === undefined) {
                    throw new Error(`[Fatal] Field '${fieldName}' is required but not provided by the build function.`);
                }
            })

            console.log(`\t[OK] Successfully validated PDF ${item.name}.`);
        }, function (err) {
            throw new Error(`[Fatal] Error reading ${item.name}: ${err}`);
        });

    })
}

// for each item in the manifest, make a new POST endpoint
manifest.forEach((item) => {
    app.post(`/${item.name}`, (req, res) => {
        let fields = item.build(req.body)

        var pdf = pdfFillForm.writeSync(item.name, fields, { "save": "pdf" });

        res.setHeader('Content-Disposition', 'inline; filename="' + item.name + '"');
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdf)

    })
})

// compares an array of required fields with the input object
// throws an error if any field is missing
// we purposefully do NOT validate any further 
function validateInput(fields, input) {
    for (const field of fields) {
        if (!input[field]) {
            throw new Error(`${field} is required.`);
        }
    }
}

// formats a date to MM-DD-YYYY
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear()

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [month, day, year].join('-');
}