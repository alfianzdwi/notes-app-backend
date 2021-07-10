//Berkas Ini Untuk Menyesuaikan Struktur/Variabel updated_At & created_at dengan cara mapping 
const mapDBToModel = ({
    title,
    body,
    tags,
    id,
    created_at,
    updated_at,
}) => ({
    title,
    body,
    tags,
    id,
    createdAt: created_at,
    updatedAt: updated_at,
})

const mapUserDBToModel = ({
    id,
    username,
    fullname
}) => ({
    id,
    username,
    fullname
})

module.exports = {mapDBToModel, mapUserDBToModel};