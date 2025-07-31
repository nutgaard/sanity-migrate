import { PatchedDocument } from "../src/Migrator";

export const name = '002-example';
export const query = `*[_type == 'exampleSchemaType' && defined(name)][0...2] {_id, _rev, name}`;

export function buildPatch(doc: any): PatchedDocument {
    return {
        id: doc._id,
        patch: {
            set: { fullname: doc.name },
            unset: ['name'],
            ifRevisionID: doc._rev
        }
    }
}