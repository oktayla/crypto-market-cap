function currencyFormatter(num, digits = 0) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: digits
    }).format(num);
}

function createSparkline(data, spacing, height, color)
{
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    const pixesPerUnit = height / range;
    let x = 0;
    let y1 = 0;
    let y2 = 0;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    svg.setAttributeNS(null, "width", spacing * (data.length - 1));
    svg.setAttributeNS(null, "height", height);

    for(let i = 0, l = data.length - 1; i < l; i++)
    {
        y1 = height - ((data[i] - min) * pixesPerUnit);
        y2 = height - ((data[i+1] - min) * pixesPerUnit);
        drawLine(svg, x, y1, x + spacing, y2, color);
        x += spacing;
    }

    return svg.outerHTML;
}

function drawLine(element, x1, y1, x2, y2, color)
{
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

    line.setAttributeNS(null, "x1", x1);
    line.setAttributeNS(null, "y1", y1);
    line.setAttributeNS(null, "x2", x2);
    line.setAttributeNS(null, "y2", y2);

    line.setAttributeNS(null, "stroke", color);
    line.setAttributeNS(null, "stroke-width", 1);

    element.appendChild(line);
}

async function main() {
    const API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true'
    const response = await fetch(API_URL)
    const data = await response.json()

    const coinList = document.getElementById('coin-list')
    coinList.innerHTML = data.map(coin => {

        const prices = coin.sparkline_in_7d.price;
        const startPrice = prices[0];
        const endPrice = prices[prices.length - 1];

        const color = (endPrice > startPrice) ? '#37d00d' : '#ea1717'
        const sparkline = createSparkline(prices, 1, 32, color);

        return `
            <tr class="coin-data small" id="${coin.id}">
                <td>${coin.market_cap_rank}</td>
                <td>
                    <img src="${coin.image}" alt="${coin.name}" height="20" class="me-1" />
                    <span>${coin.name} <small class="text-muted">${coin.symbol.toUpperCase()}</small></span>
                </td>
                <td>${currencyFormatter(coin.current_price, 2)}</td>
                <td>${sparkline}</td>
            </tr>`
    }).join('')
}
main()