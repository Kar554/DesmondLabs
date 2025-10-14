// Calculatrice
        let expression = '';
        let result = '0';

        function addToExpression(value) {
            expression += value;
            document.getElementById('expression').textContent = expression;
        }

        function clearAll() {
            expression = '';
            result = '0';
            document.getElementById('expression').textContent = '';
            document.getElementById('result').textContent = '0';
        }

        function deleteLast() {
            expression = expression.slice(0, -1);
            document.getElementById('expression').textContent = expression;
        }

        function calculate() {
            try {
                let exp = expression
                    .replace(/π/g, 'Math.PI')
                    .replace(/e(?![a-z])/g, 'Math.E')
                    .replace(/sin\(/g, 'Math.sin(')
                    .replace(/cos\(/g, 'Math.cos(')
                    .replace(/tan\(/g, 'Math.tan(')
                    .replace(/log\(/g, 'Math.log10(')
                    .replace(/sqrt\(/g, 'Math.sqrt(')
                    .replace(/\^/g, '**')
                    .replace(/(\d+)!/g, 'factorial($1)');
                
                result = eval(exp);
                document.getElementById('result').textContent = result;
            } catch (error) {
                document.getElementById('result').textContent = 'Erreur';
            }
        }

        function factorial(n) {
            if (n === 0 || n === 1) return 1;
            let result = 1;
            for (let i = 2; i <= n; i++) {
                result *= i;
            }
            return result;
        }

        // Graphiques
        function drawGraph() {
            const canvas = document.getElementById('graphCanvas');
            const ctx = canvas.getContext('2d');
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            
            const func = document.getElementById('funcInput').value;
            const xMin = parseFloat(document.getElementById('xMin').value);
            const xMax = parseFloat(document.getElementById('xMax').value);
            const step = parseFloat(document.getElementById('precision').value);
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Axes
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, canvas.height / 2);
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.stroke();
            
            // Grille
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1;
            for (let i = 0; i < canvas.width; i += 50) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, canvas.height);
                ctx.stroke();
            }
            for (let i = 0; i < canvas.height; i += 50) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(canvas.width, i);
                ctx.stroke();
            }
            
            // Fonction
            ctx.strokeStyle = '#667eea';
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            let firstPoint = true;
            let yValues = [];
            
            // Calculer les valeurs
            for (let x = xMin; x <= xMax; x += step) {
                try {
                    let exp = func
                        .replace(/x/g, `(${x})`)
                        .replace(/\^/g, '**')
                        .replace(/sin/g, 'Math.sin')
                        .replace(/cos/g, 'Math.cos')
                        .replace(/tan/g, 'Math.tan')
                        .replace(/log/g, 'Math.log10')
                        .replace(/sqrt/g, 'Math.sqrt');
                    
                    let y = eval(exp);
                    yValues.push(y);
                } catch (e) {
                    yValues.push(null);
                }
            }
            
            // Trouver min/max pour mise à l'échelle
            let yMin = Math.min(...yValues.filter(y => y !== null && isFinite(y)));
            let yMax = Math.max(...yValues.filter(y => y !== null && isFinite(y)));
            
            let index = 0;
            for (let x = xMin; x <= xMax; x += step) {
                let y = yValues[index++];
                
                if (y === null || !isFinite(y)) {
                    firstPoint = true;
                    continue;
                }
                
                let pixelX = ((x - xMin) / (xMax - xMin)) * canvas.width;
                let pixelY = canvas.height - ((y - yMin) / (yMax - yMin)) * canvas.height;
                
                if (firstPoint) {
                    ctx.moveTo(pixelX, pixelY);
                    firstPoint = false;
                } else {
                    ctx.lineTo(pixelX, pixelY);
                }
            }
            
            ctx.stroke();
        }

        // Conversions
        const conversions = {
            length: {
                units: ['Mètres', 'Kilomètres', 'Centimètres', 'Millimètres', 'Miles', 'Yards', 'Pieds', 'Pouces'],
                toBase: [1, 1000, 0.01, 0.001, 1609.34, 0.9144, 0.3048, 0.0254]
            },
            weight: {
                units: ['Kilogrammes', 'Grammes', 'Milligrammes', 'Tonnes', 'Livres', 'Onces'],
                toBase: [1, 0.001, 0.000001, 1000, 0.453592, 0.0283495]
            },
            temp: {
                units: ['Celsius', 'Fahrenheit', 'Kelvin'],
                convert: (value, from, to) => {
                    let celsius;
                    if (from === 0) celsius = value;
                    else if (from === 1) celsius = (value - 32) * 5/9;
                    else celsius = value - 273.15;
                    
                    if (to === 0) return celsius;
                    if (to === 1) return celsius * 9/5 + 32;
                    return celsius + 273.15;
                }
            }
        };

        let currentType = 'length';

        function setConversionType(type) {
            currentType = type;
            document.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            const fromUnit = document.getElementById('fromUnit');
            const toUnit = document.getElementById('toUnit');
            
            fromUnit.innerHTML = '';
            toUnit.innerHTML = '';
            
            conversions[type].units.forEach((unit, index) => {
                fromUnit.innerHTML += `<option value="${index}">${unit}</option>`;
                toUnit.innerHTML += `<option value="${index}">${unit}</option>`;
            });
            
            toUnit.selectedIndex = 1;
            convert();
        }

        function convert() {
            const fromValue = parseFloat(document.getElementById('fromValue').value) || 0;
            const fromIndex = parseInt(document.getElementById('fromUnit').value);
            const toIndex = parseInt(document.getElementById('toUnit').value);
            
            let result;
            
            if (currentType === 'temp') {
                result = conversions.temp.convert(fromValue, fromIndex, toIndex);
            } else {
                const baseValue = fromValue * conversions[currentType].toBase[fromIndex];
                result = baseValue / conversions[currentType].toBase[toIndex];
            }
            
            document.getElementById('toValue').value = result.toFixed(6);
        }

        function swapUnits() {
            const fromUnit = document.getElementById('fromUnit');
            const toUnit = document.getElementById('toUnit');
            const fromValue = document.getElementById('fromValue');
            const toValue = document.getElementById('toValue');
            
            [fromUnit.value, toUnit.value] = [toUnit.value, fromUnit.value];
            [fromValue.value, toValue.value] = [toValue.value, fromValue.value];
            
            convert();
        }

      function switchTab(tabName, event) {
    // Retirer l'état actif de tous les onglets
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Ajouter l'état actif à l'onglet cliqué et au contenu correspondant
    if(event) event.currentTarget.classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

        // Initialisation
        setConversionType('length');