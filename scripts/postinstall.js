#!/usr/bin/env node
/**
 * Posle `npm install` kopira self-hosted TinyMCE (npm paket `tinymce`) i Kancelarko icon pack
 * u <projekat>/public/tinymce, da bi KTextEditor mogao da ucita /tinymce/tinymce.min.js.
 * Nema rucnog pokretanja ni iskljucivanja: svaki install osvezava folder.
 * Projekat je folder iz kog je npm install pozvan (INIT_CWD); u razvoju biblioteke to je sama biblioteka,
 * pa i playground dobija svoj public/tinymce.
 */
import { createRequire } from 'node:module'
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const projectDir = resolve(process.env.INIT_CWD || process.cwd())
const target = join(projectDir, 'public', 'tinymce')

function findTinymce() {
    for (const from of [join(projectDir, 'package.json'), import.meta.url]) {
        try {
            const dir = dirname(createRequire(from).resolve('tinymce/package.json'))

            if (existsSync(join(dir, 'tinymce.min.js'))) return dir
        } catch (error) {
            /* probaj sledeci */
        }
    }

    return null
}

const tinymceDir = findTinymce()

if (!tinymceDir) {
    console.error('[@zivojindavidovic/ui] Paket "tinymce" nije pronadjen, TinyMCE nije kopiran u public/tinymce.')
    process.exit(1)
}

mkdirSync(target, { recursive: true })
cpSync(tinymceDir, target, {
    recursive: true,
    filter: (src) => !src.includes(join(tinymceDir, 'node_modules')),
})

// Kancelarko icon pack (src/helpers/tinymce-icons.js) -> icons/kancelarko/icons.js, kako TinyMCE ocekuje
const iconPackTarget = join(target, 'icons', 'kancelarko')
mkdirSync(iconPackTarget, { recursive: true })
cpSync(join(packageRoot, 'src', 'helpers', 'tinymce-icons.js'), join(iconPackTarget, 'icons.js'))

console.log(`[@zivojindavidovic/ui] TinyMCE + Kancelarko icon pack -> ${target}`)
