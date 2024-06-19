const path = require('path');
const {Document, User, Category} = require('../models');
const fs = require('fs');
// const transporter = require ('../config/nodemailer')

const getDocument = async (req, res, next) => {
    try {
        const categoryFilter = req.query.category;
        const sort = req.query.sort || "ASC";
        const queryOptions = {
            include: [
                {
                    model: Category,
                    attributes: ["name"]
                }
            ],
            order: [
                ['createdAt', sort.toUpperCase()]
            ]
        };
        if (categoryFilter) {
            queryOptions.include[0].where = { name: categoryFilter };
        }
        const document = await Document.findAll(queryOptions);
        if (!document || document.length === 0) {
            return res
                .status(404)
                .json({message: "No documents found"});
        }
        res
            .status(200)
            .json(document);
    } catch (err) {
        console.error(err);
        return res
            .status(500)
            .send('Error getting data');
    }
};

const createDocument = async (req, res, next) => {
    try {
        if (!(req.user && (req.user.role === 'admin' || req.user.role === 'staff'))) {
            return res
                .status(401)
                .json({message: "Access denied. Only admins and staff can create documents."});
        }

        const files = req.files;
        const document = files
            ? files.document
            : null;
        const categoryId = req.body.categoryId;

        if (!document) 
            return res
                .status(400)
                .json({message: 'Document not created'});
        
        const originalName = document.name;
        const documentName = originalName
            .split(' ')
            .join('-');
        const documentPath = path.join(__dirname, '../public/document', documentName);

        console.log(document.name)

        document.mv(documentPath, (err) => {
            if (err) {
                return res
                    .status(500)
                    .json({message: "Failed to upload document", error: err});
            }
        });

        const documentUrl = `${req
            .protocol}://${req
            .get('host')}/public/document/${documentName}`;

        const currentDate = new Date();
        const formattedDate = currentDate
            .toISOString()
            .split('T')[0];

        const datas = await Document.create(
            {
                document: documentUrl, 
                categoryId: categoryId, 
                name: document.name, 
                tanggal: formattedDate
            }
        );

        res
            .status(200)
            .json({error: false, message: "Create data success", datas});
    } catch (err) {
        console.log(err);
        res
            .status(500)
            .json({message: "Failed to create data", error: err});
    }
};

const rename = async (req, res) => {
    try {
        if (!(req.user && (req.user.role === 'admin' || req.user.role === 'staff'))) {
            return res
                .status(401)
                .json({message: "Access denied. Only admins and staff can rename documents."});
        }

        const {newName} = req.body;
        const id = req.params.id
        if (!newName) {
            return res
                .status(400)
                .json({message: "Document ID and new name are required."});
        }

        const document = await Document.findByPk(id);

        if (!document) {
            return res
                .status(404)
                .json({message: "Document not found."});
        }

        const url = document.document;
        const parts = url.split('/');
        const filename = parts[parts.length - 1];
        const extension = filename.split('.').pop();
        const basename = filename.substring(0, filename.lastIndexOf('.'));
        const newFilename = `${newName}.${extension}`;
        const oldPath = path.join(
            __dirname,
            '../public/document',
            `${basename}.${extension}`
        );

        const categoryId = req.body.categoryId;
        const newPath = path.join(__dirname, '../public/document', newFilename);

    fs.rename(oldPath, newPath, (err) => {
            if (err) {
                return res
                    .status(500)
                    .json({message: "Failed to rename document", error: err});
            }
        });

        const documentUrl = `${req
            .protocol}://${req
            .get('host')}/public/document/${newFilename}`;
        
        const currentDate = new Date();
        const formattedDate = currentDate
            .toISOString()
            .split('T')[0];

        await Document.update({
            document: documentUrl,
            categoryId: categoryId,
            name: newName,
            tanggal: formattedDate

        }, {where: {
                id
            }});

        res
            .status(200)
            .json({error: false, message: "Rename success"});
    } catch (err) {
        console.log(err);
        res
            .status(500)
            .json({message: "Failed to rename document", error: err});
    }
};

const deleteDocument = async (req, res) => {
    try {
        if (!(req.user && (req.user.role === 'admin' || req.user.role === 'staff'))) {
            return res
                .status(401)
                .json(
                    {message: "Access denied. Only admins and karyawan can delete documents."}
                );
        }

        const dataDocument = await Document.findByPk(req.params.id);
        if (!dataDocument) 
            return res
                .status(404)
                .json({message: `ID is not valid: ${req.params.id} not found`});
        
        const fileDocument = dataDocument
            .document
            .substring(dataDocument.document.lastIndexOf('/') + 1);
        const destroyDocument = path.join(
            __dirname,
            '../public',
            'document',
            fileDocument
        );

        if (fs.existsSync(destroyDocument)) {
            fs.unlinkSync(destroyDocument);
        }

        await Document.destroy({
            where: {
                id: req.params.id
            }
        });

        res
            .status(200)
            .json({message: "Delete data success"});
    } catch (err) {
        console.log(err);
        res
            .status(500)
            .json({message: "Error", error: err});
    }
};

const downloadDocument = async (req, res) => {
    try {
        const document = await Document.findByPk(req.params.id);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        const filePath = path.join(__dirname, '../public/document', document.document.split('/').pop());
        if (fs.existsSync(filePath)) {
            return res.download(filePath);
        } else {
            return res.status(404).json({ message: "File not found" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error downloading document", error: err });
    }
};

// const downloadDocument = async (req, res) => {
//     try {
//         const document = await Document.findByPk(req.params.id);
//         if (!document) {
//             return res.status(404).json({ message: "Document not found" });
//         }

//         const filePath = path.join(__dirname, '../public/document', document.document.split('/').pop());

//         if (!(req.user && (req.user.role === 'admin' || req.user.role === 'staff'))) {
//             const { email } = req.body;
//             if (!email) {
//                 return res.status(400).json({ message: "Email is required for non-admin/staff users." });
//             }

//             // Send the document to the provided email
//             if (fs.existsSync(filePath)) {
//                 const mailOptions = {
//                     from: 'your-email@gmail.com',
//                     to: email,
//                     subject: `Requested Document: ${document.name}`,
//                     text: `Please find the requested document ${document.name} attached.`,
//                     attachments: [
//                         {
//                             filename: path.basename(filePath),
//                             path: filePath
//                         }
//                     ]
//                 };

//                 transporter.sendMail(mailOptions, (error, info) => {
//                     if (error) {
//                         return res.status(500).json({ message: "Failed to send email", error });
//                     }
//                     return res.status(200).json({ message: `Document sent to ${email}` });
//                 });
//             } else {
//                 return res.status(404).json({ message: "File not found" });
//             }
//         } else {
//             if (fs.existsSync(filePath)) {
//                 return res.download(filePath);
//             } else {
//                 return res.status(404).json({ message: "File not found" });
//             }
//         }
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ message: "Error downloading document", error: err });
//     }
// };

module.exports = {
    getDocument,
    createDocument,
    rename,
    deleteDocument,
    downloadDocument
};

