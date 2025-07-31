import {MigrationModule, PatchedDocument} from "../src/Migrator";

export const migration: MigrationModule = {
    name: '001-example',
    query: `*[_type == 'exampleSchemaType' && defined(name)][0...2] {_id, _rev, name}`,
    buildPatch(doc: any): PatchedDocument {
        return {
            id: doc._id,
            patch: {
                set: { fullname: doc.name },
                unset: ['name'],
                ifRevisionID: doc._rev
            }
        }
    }
}