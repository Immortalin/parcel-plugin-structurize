const Path = require('path');
const fs = require('fs');
const move = require('glob-move');
const chalk = require('chalk');

const { extractFileName } = require('../util');

module.exports = function({ dist, prefix, options, markups }) {
    return new Promise(resolve => {
        const { folder, match } = options;

        move(`${dist}/${match}`, `${dist}/${folder}`)
            .then(async () => {
                await markups.forEach(async document => {
                    const allScripts = document.querySelectorAll('script');

                    const path = `${prefix}/${folder}/`;

                    await allScripts.forEach(async script => {
                        const oldFilePath = script.src;
                        const fileName = extractFileName(oldFilePath);
                        const scriptPath = Path.join(dist, folder, fileName);
                        const content = await fs
                            .readFileSync(scriptPath)
                            .toString();
                        script.src = `${path}${extractFileName(script.src)}`;
                        fs.writeFileSync(
                            scriptPath,
                            content.replace(oldFilePath, script.src)
                        );
                    });
                });

                resolve();
            })
            .catch(e => {
                console.log(
                    chalk.red.bold(
                        'Error while structurizing scripts. Please check structures.'
                    )
                );
                console.log(chalk.gray('Dist path:', dist));
                console.log(e);
                process.exit();
            });
    });
};
