function gen(start, end, steps) {
    let w = ['0%'], t = [0, start - 0.001];
    w.push('0%');
    let dt = (end - start) / steps;
    for (let i = 1; i <= steps; i++) {
        let t_jump = start + i * dt;
        t.push(Number((t_jump - 0.001).toFixed(4)));
        w.push(((i - 1) / steps * 100).toFixed(2) + '%');
        t.push(Number((t_jump).toFixed(4)));
        w.push((i / steps * 100).toFixed(2) + '%');
    }
    t.push(0.9); w.push('100%');
    t.push(0.95); w.push('0%');
    return { w, t };
}
console.log('CHECK_W:', JSON.stringify(gen(0.25, 0.4, 19).w));
console.log('CHECK_T:', JSON.stringify(gen(0.25, 0.4, 19).t));
console.log('MOVE_W:', JSON.stringify(gen(0.45, 0.6, 11).w));
console.log('MOVE_T:', JSON.stringify(gen(0.45, 0.6, 11).t));
