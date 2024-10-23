import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalComponent from './Modal';
import { addDoc, collection, onSnapshot, doc, deleteDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { database } from '../../firebase/firebase'; // Ensure the path is correct
import { getAuth } from 'firebase/auth'; // To get the current user's email

export default function Docs() {
    const [open, setOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false); // State for share modal
    const [title, setTitle] = useState('');
    const [docsData, setDocsData] = useState({
        createdByMe: [],
        sharedWithMe: []
    });
    const [shareEmail, setShareEmail] = useState(''); // State for the email to share with
    const [currentDocId, setCurrentDocId] = useState(''); // To track the current document being shared
    const isMounted = useRef(false);
    const navigate = useNavigate();
    const auth = getAuth(); // Get auth instance
    const user = auth.currentUser; // Get the current logged-in user

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleShareOpen = (id) => {
        setCurrentDocId(id); // Set the document ID for sharing
        setShareOpen(true); // Open the share modal
    };
    const handleShareClose = () => setShareOpen(false);

    const collectionRef = collection(database, 'docsData');

    // Function to add data to Firebase Firestore and store the email of the logged-in user
    const addData = () => {
        if (user) {
            addDoc(collectionRef, {
                title: title,
                email: user.email, // Store the email in the Firestore collection
                sharedEmails: [] // Initialize the sharedEmails array
            })
                .then(() => {
                    alert('Data Added');
                    handleClose();
                })
                .catch(() => {
                    alert('Cannot add data');
                });
        }
    };

    // Fetch data from Firebase Firestore
    const getData = () => {
        onSnapshot(collectionRef, (data) => {
            const createdByMe = data.docs.filter(doc => doc.data().email === user.email); // Docs by the logged-in user
            const sharedWithMe = data.docs.filter(doc => doc.data().sharedEmails && doc.data().sharedEmails.includes(user.email)); // Docs shared with the user

            // Update state with both arrays
            setDocsData({
                createdByMe: createdByMe.map(doc => ({ ...doc.data(), id: doc.id })),
                sharedWithMe: sharedWithMe.map(doc => ({ ...doc.data(), id: doc.id }))
            });
        });
    };

    // Function to delete a document from Firebase Firestore
    const deleteDocument = (id) => {
        const documentRef = doc(database, 'docsData', id); // Reference to the document
        deleteDoc(documentRef)
            .then(() => {
                alert('Document Deleted');
            })
            .catch((error) => {
                alert('Cannot delete document: ' + error.message);
            });
    };

    // Function to share a document by adding an email to the `sharedEmails` array
    const shareDocument = () => {
        const documentRef = doc(database, 'docsData', currentDocId);
        updateDoc(documentRef, {
            sharedEmails: arrayUnion(shareEmail) // Add the email to the sharedEmails array
        })
            .then(() => {
                alert('Document shared successfully');
                handleShareClose(); // Close the share modal
            })
            .catch((error) => {
                alert('Error sharing document: ' + error.message);
            });
    };

    // Fetch data when the component mounts
    useEffect(() => {
        if (isMounted.current) return;

        isMounted.current = true;
        getData();
    }, []);

    // Get ID and navigate to the EditDocs page
    const getID = (id) => {
        navigate(`/editDocs/${id}`); // Ensure the user is coming from the home page
    };

    return (
        <div className='docs-main'>
            <h1>Document Collaboration Software</h1>
            <button className='add-docs' onClick={handleOpen}>
                Add a Document
            </button>

            <ModalComponent
                open={open}
                setOpen={setOpen}
                title={title}
                setTitle={setTitle}
                addData={addData}
            />

            {/* Documents Created by Me */}
            <div className='section'>
                <h2>Documents Created by You</h2>
                <div className='grid-main'>
                    {docsData.createdByMe.length === 0 ? (
                        <p>No documents created by you.</p>
                    ) : (
                        docsData.createdByMe.map((doc) => (
                            <div className='grid-child' key={doc.id}>
                                <p onClick={() => getID(doc.id)}>{doc.title}</p>
                                <button
                                    className='delete-docs'
                                    onClick={() => deleteDocument(doc.id)}
                                >
                                    Delete
                                </button>
                                <button
                                    className='share-docs'
                                    onClick={() => handleShareOpen(doc.id)} // Open share modal for this document
                                >
                                    Share
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Documents Shared with Me */}
            <div className='section'>
                <h2>Documents Shared with You</h2>
                <div className='grid-main'>
                    {docsData.sharedWithMe.length === 0 ? (
                        <p>No documents shared with you.</p>
                    ) : (
                        docsData.sharedWithMe.map((doc) => (
                            <div className='grid-child' key={doc.id}>
                                <p onClick={() => getID(doc.id)}>{doc.title}</p>
                                {/* Removed the Share button for documents shared with the user */}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Share Modal */}
            {shareOpen && (
                <div className='share-modal'>
                    <h2>Share Document</h2>
                    <input
                        type='email'
                        placeholder='Enter email to share with'
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                    />
                    <button onClick={shareDocument}>Share</button>
                    <button onClick={handleShareClose}>Cancel</button>
                </div>
            )}
        </div>
    );
}
