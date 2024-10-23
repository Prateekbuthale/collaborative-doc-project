import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
    updateDoc,
    collection,
    doc,
    onSnapshot,
    getFirestore
} from 'firebase/firestore';
import { saveAs } from 'file-saver'; // For saving file locally
import { storage } from '../../firebase/firebase'; // Ensure your Firebase storage config is correct
import { ref, uploadBytesResumable } from 'firebase/storage'; // For uploading to Firebase Storage
import { Packer, Document, Paragraph } from 'docx'; // To generate .docx files
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EditDocs({ database }) {
    const isMounted = useRef(false);
    const db = getFirestore();
    const collectionRef = collection(db, 'docsData');
    const params = useParams();
    
    const [documentTitle, setDocumentTitle] = useState('');
    const [docsDesc, setDocsDesc] = useState('');

    // Get content from the Quill editor
    const getQuillData = (value) => {
        setDocsDesc(value);
    };

    // Fetch data from Firestore
    const getData = () => {
        const documentRef = doc(collectionRef, params.id);
        onSnapshot(documentRef, (docs) => {
            const data = docs.data();
            setDocumentTitle(data?.title || '');  // Use optional chaining to avoid errors
            setDocsDesc(data?.docsDesc || '');    // Ensure it's not undefined
        });
    };

    // Save document as a .docx file locally
    const saveDocumentLocally = () => {
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [new Paragraph(docsDesc)] // Add content here
                }
            ]
        });

        Packer.toBlob(doc).then((blob) => {
            saveAs(blob, `${documentTitle}.docx`);
            toast.success('Document saved locally as .docx', { autoClose: 2000 });
        });
    };

    // Save document as a .docx file to Firebase Storage
    const saveDocumentToFirebase = () => {
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [new Paragraph(docsDesc)] // Add content here
                }
            ]
        });

        Packer.toBlob(doc).then((blob) => {
            const storageRef = ref(storage, `docs/${documentTitle}.docx`);
            const uploadTask = uploadBytesResumable(storageRef, blob);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                },
                (error) => {
                    console.error('Error uploading file:', error);
                    toast.error('Failed to upload document to Firebase', { autoClose: 2000 });
                },
                () => {
                    toast.success('Document uploaded to Firebase Storage successfully', { autoClose: 2000 });
                }
            );
        });
    };

    // Fetch and update document in Firestore
    useEffect(() => {
        const updateDocsData = setTimeout(() => {
            if (docsDesc !== undefined && docsDesc !== '') {
                const documentRef = doc(collectionRef, params.id);
                updateDoc(documentRef, {
                    docsDesc: docsDesc
                })
                    .then(() => {
                        toast.success('Document Saved', { autoClose: 2000 });
                    })
                    .catch((error) => {
                        toast.error('Cannot Save Document: ' + error.message, { autoClose: 2000 });
                    });
            }
        }, 1000);
        return () => clearTimeout(updateDocsData);
    }, [docsDesc, params.id]);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            getData();
        }
    }, []);

    return (
        <div className='editDocs-main'>
            {/* Save buttons */}
            <div className='save-btns'>
                <div>
                    <button onClick={saveDocumentLocally} className='sbtn'>
                        Save as .docx locally
                    </button>
                </div>
                <div>
                    <button onClick={saveDocumentToFirebase} className='sbtn'>
                        Save to Firebase Storage
                    </button>
                </div>
                
            </div>
            <h1>{documentTitle}</h1>
            <div className='editDocs-inner'>
                <ReactQuill
                    className='react-quill'
                    value={docsDesc}
                    onChange={getQuillData}
                />
            </div>

            

            <ToastContainer />
        </div>
    );
}
