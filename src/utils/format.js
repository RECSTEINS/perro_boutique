export function formatPrice(cents) {
    if (cents == null) return '';
    const pesos = cents / 100;
    
    const fractionDigits = pesos % 1 === 0 ? 0 : 2;
    const formatted = pesos.toLocaleString('es-MX', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: 2
    });
    return `$${formatted} MXN`;
}

export function formatPriceRange(variants) {
    if (!variants || variants.length === 0) return '';
    const prices = variants.map((v) => v.price_cents);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return formatPrice(min);
    return `desde ${formatPrice(min)}`;
}