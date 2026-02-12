import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

/**
 * POST /api/admin/upload — Upload un fichier vers Cloudinary.
 * Accepte un FormData avec un champ `file` (PDF ou image).
 * Le champ `type` optionnel peut être "image" pour uploader une image.
 * Retourne l'URL sécurisée du fichier uploadé.
 */

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            return NextResponse.json(
                { error: "Cloudinary non configuré. Ajoutez les variables d'environnement CLOUDINARY_*." },
                { status: 503 }
            );
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const uploadType = formData.get("type") as string | null; // "image" ou null (= PDF)

        if (!file) {
            return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
        }

        const isImage = uploadType === "image";

        // Validation selon le type
        if (isImage) {
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                return NextResponse.json({ error: "Format d'image non supporté. Utilisez JPG, PNG, WebP ou GIF." }, { status: 400 });
            }
            if (file.size > 5 * 1024 * 1024) {
                return NextResponse.json({ error: "L'image dépasse 5 MB" }, { status: 400 });
            }
        } else {
            if (file.type !== "application/pdf") {
                return NextResponse.json({ error: "Seuls les fichiers PDF sont acceptés" }, { status: 400 });
            }
            if (file.size > 10 * 1024 * 1024) {
                return NextResponse.json({ error: "Le fichier dépasse 10 MB" }, { status: 400 });
            }
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    isImage
                        ? {
                            resource_type: "image",
                            folder: "jangatub/covers",
                            transformation: [
                                { width: 800, height: 600, crop: "limit", quality: "auto", format: "webp" },
                            ],
                        }
                        : {
                            resource_type: "raw",
                            folder: "jangatub/documents",
                            format: "pdf",
                            access_mode: "public",
                        },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                )
                .end(buffer);
        });

        return NextResponse.json({
            url: result.secure_url,
            publicId: result.public_id,
            size: result.bytes,
        });
    } catch (error) {
        console.error("[ADMIN_UPLOAD]", error);
        return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
    }
}
