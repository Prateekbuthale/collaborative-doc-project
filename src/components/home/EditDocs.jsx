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
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export default function EditDocs({ database }) {
    const isMounted = useRef(false);
    // Ensure `database` is passed as the Firestore instance
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

    // Update document in Firestore with debounce
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
    }, [docsDesc, params.id]); // Added params.id to the dependency array

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            getData();
        }
    }, []);

    return (
        <div className='editDocs-main'>
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
