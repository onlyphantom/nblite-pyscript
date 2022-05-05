function openNbAsPyScript(url, targetId) {
    fetch(url)
        .then(response => response.json())
        .then(json => nbToPyScript(json))
        .then(pyScriptHtml => createIframe(pyScriptHtml, targetId))
        .catch(error => {
            console.error(error);
        });
}

// Parses cell source content to find imports
const getDeps = (content) => content
    .split(/[\s,]+/)
    .filter((_, i, arr) => 
        (arr[i-1] == 'from' && arr[i+1] == 'import')  // from x import y
        || (arr[i-1] == 'import' && arr[i-3] != 'from')) // import y + import y as
    .map(el => el.split('.').shift())

function nbToPyScript(nb) {
    let  =  [] 
    scripts = nb['cells'].map(cell => { 
        if (cell.cell_type == 'code') {
            return `<py-repl>\n${cell.source.join('')}\n</py-repl>`
        } else if (cell.cell_type == 'markdown'){
            return marked.parse(cell.source.join(''))
        } else {
            return marked.parse('```\n'+cell.source.join('')+'\n```')
        } 
    }).join('\n');
    
    return [
        '<html>',
        '<head>',
        '<link rel="stylesheet" href="https://pyscript.net/alpha/pyscript.css" />',
        '<script defer src="https://pyscript.net/alpha/pyscript.js"></script>',
        '<py-env>',
        ...getDeps(scripts).map(dep => `- `+dep),
        '</py-env>',
        '</head>',
        '<body>',
        scripts,
        '</body>',
        '</html>'
    ].join("\n")
}

function createIframe(htmlContent, targetId) {
    var iframe = document.createElement('iframe');
    document.getElementById(targetId).appendChild(iframe)
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(htmlContent);
    iframe.contentWindow.document.close();
}

window.nblite = {
    openNbAsPyScript: openNbAsPyScript,
    nbToPyScript: nbToPyScript
}
