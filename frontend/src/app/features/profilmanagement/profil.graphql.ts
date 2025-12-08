export const PROFIL_FIELDS = {
    // Champs pour la liste des utilisateurs
    users: `
        items {
            id
            username
            email
            firstName
            lastName
            isActive
            dateJoined
            roles {
                id
                name
            }
        }
        totalCount
        numPages
        currentPage
        pageSize
    `,

    // Champs pour la liste des rôles
    roles: `
        id
        name
        permissions {
            id
        }
    `,

    // Champs pour le détail d'un rôle (incluant les noms des permissions)
    roleDetail: `
        id
        name
        permissions {
            id
            name
        }
    `,

    // Champs pour la liste des permissions
    permissions: `
        id
        name
        codename
        tag
    `
};
