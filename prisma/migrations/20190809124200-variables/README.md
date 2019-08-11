# Migration `20190809124200-variables`

This migration has been generated at 8/9/2019, 12:42:00 PM.
You can check out the [state of the datamodel](./datamodel.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "dev"."Variable"("id" INTEGER NOT NULL DEFAULT 0 ,"index" TEXT NOT NULL DEFAULT '' ,"name" TEXT NOT NULL DEFAULT '' ,"value" TEXT NOT NULL DEFAULT '' ,"app" TEXT NOT NULL DEFAULT '' ,PRIMARY KEY ("id"));

CREATE UNIQUE INDEX "dev"."Variable.index._UNIQUE" ON "Variable"("index")
```

## Changes

```diff
diff --git datamodel.mdl datamodel.mdl
migration ..20190809124200-variables
--- datamodel.dml
+++ datamodel.dml
@@ -1,0 +1,16 @@
+generator photon {
+  provider = "photonjs"
+}
+
+datasource sqlite {
+  provider = "sqlite"
+  url      = env("SQLITE_URL")
+}
+
+model Variable {
+  id    Int    @id
+  index String @unique
+  name  String
+  value String
+  app   String
+}
```

## Photon Usage

You can use a specific Photon built for this migration (20190809124200-variables)
in your `before` or `after` migration script like this:

```ts
import Photon from '@generated/photon/20190809124200-variables'

const photon = new Photon()

async function main() {
  const result = await photon.users()
  console.dir(result, { depth: null })
}

main()

```
