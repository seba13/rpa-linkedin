export interface Post{
    id_post: number,
    idCompany: number,
    name_company: string,
    description: string,
    published_date: Date,
    tag: string,
    latest: Boolean
}
