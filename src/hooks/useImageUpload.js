import { useState } from "react";
import { supabase } from "../lib/supabase";

const BUCKET = 'product-images';

function uniqueFileName(file){
    const ext = file.name.split('.').pop().toLowerCase();
    const random = Math.random().toString(16).slice(2, 6);
    return `${Date.now()}-${random}.${ext}`;
}

export function useImageUpload(){
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    async function uploadOne(file){
        const fileName = uniqueFileName(file);

        const {error: uploadError} = await supabase.storage.from(BUCKET).upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

        if(uploadError){
            throw uploadError;
        }

        const {data} = supabase.storage.from(BUCKET).getPublicUrl(fileName);
        return data.publicUrl;
    }

    async function uploadMany(files){
        setUploading(true);
        setError(null);
        try{
            const urls = await Promise.all(
                Array.from(files).map((file) => uploadOne(file))
            );
            return urls;
        } catch(err){
            console.error('Error al subir imágenes: ',err)
            setError(err.message || 'No se pudo subir la imagen.')
            return[];
        } finally{
            setUploading(false);
        }
    }

    async function removeByUrl(publicUrl){
        try{
            const marker = `/${BUCKET}/`;
            const index = publicUrl.indexOf(marker)
            if(index === -1) return;
            const fileName = publicUrl.slice(index + marker.length);

            const { error: removeError} =await supabase.storage.from(BUCKET).remove([fileName]);

            if(removeError) throw removeError;
        } catch(err){
            console.error('Error al borrar imagen: ', err);
        }
    }

    return { uploadMany, removeByUrl, uploading, error};
}