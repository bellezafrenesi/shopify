/* Diagnóstico de belleza · Belleza Frenesí · núcleo compartido por las 3 variaciones (2026-11-19)
   Preguntas, puntaje, resultados en pantalla, PDF y captura de correo. Cada variación define su flujo con DIAG.start(modo). */
(function () {
  'use strict';
  var D = window.DIAG = {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  // ---------- Áreas ----------
  D.AREAS = {
    piel: { n: 'Piel', i: '✨' }, cabello: { n: 'Cabello', i: '💇‍♀️' }, unas: { n: 'Uñas', i: '💅' },
    movilidad: { n: 'Movilidad', i: '🦵' }, energia: { n: 'Energía', i: '⚡' }, hidratacion: { n: 'Hidratación', i: '💧' },
    nutricion: { n: 'Nutrición', i: '🥗' }, descanso: { n: 'Descanso', i: '🌙' }, sol: { n: 'Protección solar', i: '☀️' }
  };

  // ---------- Preguntas ----------
  D.Q = [
    { id: 'nombre', t: '¿Cómo te llamas?', s: 'Así personalizamos tu diagnóstico.', type: 'text', ph: 'Tu nombre' },
    { id: 'edad', t: '¿En qué rango de edad estás?', s: 'Con los años cambian las necesidades de la piel.', o: [['25 a 34', '🌱'], ['35 a 44', '🌷'], ['45 a 54', '🌺'], ['55 o más', '🌻']] },
    { id: 'piel', t: 'Cuando te miras al espejo en la mañana, tu piel se ve…', a: 'piel', o: [['Luminosa y descansada', '✨', 90], ['Un poco apagada', '🌥️', 62], ['Opaca, con cara de cansancio', '😴', 40], ['Reseca o tirante', '🏜️', 38]] },
    { id: 'cabello', t: '¿Cuánto cabello ves en el cepillo o en la ducha?', a: 'cabello', o: [['Lo normal', '🙂', 90], ['Un poco más que antes', '🤔', 58], ['Bastante más que antes', '😟', 32]] },
    { id: 'unas', t: 'Tus uñas…', a: 'unas', o: [['Están fuertes y crecen bien', '💪', 90], ['Se doblan o están blanditas', '🫧', 50], ['Se parten o se descaman', '💔', 34]] },
    { id: 'movilidad', t: 'Al subir escaleras o agacharte, tus rodillas y articulaciones…', a: 'movilidad', o: [['Ni las siento', '🏃‍♀️', 92], ['A veces se sienten rígidas', '🦵', 60], ['Me molestan seguido', '🩹', 30]] },
    { id: 'energia', t: '¿Cómo llegas al final del día?', a: 'energia', o: [['Con energía', '⚡', 90], ['Cansada, pero bien', '🔋', 60], ['Agotada casi siempre', '🪫', 30]] },
    { id: 'descanso', t: '¿Cuántas horas duermes normalmente?', a: 'descanso', o: [['Menos de 6', '🥱', 30], ['Entre 6 y 7', '😌', 64], ['7 a 8 o más', '😴', 92]] },
    { id: 'agua', t: '¿Cuántos vasos de agua tomas al día?', s: 'Sin contar café, jugos ni gaseosa.', a: 'hidratacion', o: [['1 o 2', '🥤', 25], ['3 a 5', '💧', 58], ['6 o más', '🌊', 92]] },
    { id: 'proteina', t: '¿En cuántas comidas del día hay proteína?', s: 'Huevo, pollo, carne, pescado, fríjol, lenteja, leche, yogur o queso.', a: 'nutricion', o: [['En una o en ninguna', '🍞', 30], ['En dos', '🍳', 62], ['En las tres', '🍗', 92]] },
    { id: 'lacteos', t: '¿Cuántas porciones de lácteos tomas al día?', s: 'Leche, yogur, kumis o queso.', a: 'nutricion', o: [['Casi nunca', '🚫', 30], ['Una', '🥛', 60], ['Dos o más', '🧀', 90]] },
    { id: 'frutas', t: '¿Cuántas frutas y verduras comes al día?', a: 'nutricion', o: [['Una o ninguna', '🍟', 28], ['Dos o tres', '🍊', 60], ['Cuatro o más', '🥑', 92]] },
    { id: 'sol', t: '¿Usas protector solar todos los días?', a: 'sol', o: [['Nunca o casi nunca', '🌞', 20], ['Solo cuando salgo al sol', '⛱️', 55], ['Todos los días', '🧴', 95]] },
    { id: 'movimiento', t: '¿Cuántos días a la semana caminas o haces ejercicio 30 minutos?', a: 'mov2', o: [['0 o 1', '🛋️', 30], ['2 o 3', '🚶‍♀️', 62], ['4 o más', '🏃‍♀️', 92]] },
    { id: 'meta', t: '¿Qué es lo que más te importa cuidar?', s: 'Puedes elegir varias.', multi: true, o: [['Mi piel', '✨', 'piel'], ['Mi cabello', '💇‍♀️', 'cabello'], ['Mis uñas', '💅', 'unas'], ['Mi energía', '⚡', 'energia'], ['Moverme mejor', '🦵', 'movilidad']] }
  ];

  // ---------- Textos por área (argumento + hábitos) ----------
  D.TXT = {
    piel: { por: 'El colágeno es la proteína que le da soporte a la piel, y con los años el cuerpo fabrica cada vez menos. Por eso la piel se ve más apagada, y se nota más si falta agua, sueño o protector solar.', h: ['Protector solar todos los días, también cuando está nublado.', 'Frutas con vitamina C (guayaba, naranja, mandarina, fresa): el cuerpo la usa para fabricar colágeno.', 'Proteína en cada comida.', 'Desmaquíllate y lávate la cara antes de dormir.'] },
    cabello: { por: 'El cabello está hecho de queratina, una proteína. Cuando comes poca proteína o hierro, duermes poco o pasas por estrés, se puede caer más. Si la caída es mucha o llegó de repente, consúltalo con tu médico o dermatólogo.', h: ['Proteína en cada comida y hierro varias veces por semana (lenteja, fríjol, carne).', 'No lo amarres muy apretado y baja la temperatura del secador.', 'Hidrata las puntas una vez por semana.'] },
    unas: { por: 'Las uñas también son queratina. Se debilitan con el agua, los jabones y los químicos de la casa, y cuando falta proteína en la comida.', h: ['Usa guantes al lavar la loza o limpiar.', 'Crema en manos y cutículas antes de dormir.', 'Lima en una sola dirección y dale descansos al esmalte.'] },
    movilidad: { por: 'Moverte mantiene fuertes los músculos que protegen las rodillas, y el calcio y la vitamina D cuidan los huesos. Si te molestan seguido o hay inflamación, consúltalo con tu médico: este test no reemplaza una valoración.', h: ['Camina 30 minutos al día, aunque sea en dos partes.', 'Dos o tres porciones de lácteos al día para el calcio.', 'Unos minutos de sol de la mañana, con protector en la cara.', 'Sube las escaleras despacio y apoyando todo el pie.'] },
    energia: { por: 'El cansancio diario suele venir de dormir poco, tomar poca agua y comer sin proteína. Son tres cosas que se pueden mover desde mañana.', h: ['Desayuna con proteína (huevo, yogur o queso).', 'Un vaso de agua apenas te levantes.', 'Una caminata corta después del almuerzo.', 'Apaga pantallas 30 minutos antes de dormir.'] },
    hidratacion: { por: 'Cuando el cuerpo tiene poca agua, la piel lo muestra tirante y opaca, y el cansancio aumenta.', h: ['Meta: 6 a 8 vasos al día.', 'Deja una botella a la vista y tómala antes de cada comida.', 'Si te aburre el agua sola, ponle rodajas de limón o pepino.'] },
    nutricion: { por: 'Tu piel, tu cabello y tus uñas se construyen con lo que comes: proteína, vitamina C, calcio y hierro. Una comida sin proteína es una oportunidad perdida.', h: ['Proteína en las tres comidas.', 'Dos o tres lácteos al día.', 'Cuatro o cinco porciones de frutas y verduras de colores.'] },
    descanso: { por: 'Mientras duermes el cuerpo se repara. Dormir menos de 7 horas se nota en la cara y en la energía del día siguiente.', h: ['Acuéstate a la misma hora, también el fin de semana.', 'Cena liviana y temprano.', 'Celular fuera de la cama.'] },
    sol: { por: 'El sol es la principal causa del envejecimiento visible de la piel: manchas, textura y pérdida de luminosidad. En Colombia el índice UV es alto todo el año.', h: ['Protector FPS 50 todas las mañanas, en cara, cuello y manos.', 'Reaplícalo al mediodía si sales.', 'Gorra o sombrilla entre las 10 a. m. y las 3 p. m.'] }
  };

  D.PLAN = [
    ['Lunes', 'Huevos pericos, arepa pequeña y papaya', 'Pechuga a la plancha, arroz, ensalada y fríjoles', 'Yogur con fresas', 'Crema de ahuyama con queso'],
    ['Martes', 'Avena en leche con banano', 'Pescado sudado, arroz y ensalada', 'Mandarina y un puñado de maní', 'Tortilla de huevo con espinaca'],
    ['Miércoles', 'Arepa con queso, huevo y jugo de guayaba', 'Lentejas, arroz y carne molida', 'Kumis', 'Ensalada de atún con aguacate'],
    ['Jueves', 'Calentado ligero con huevo', 'Pollo sudado, papa y ensalada', 'Fruta con queso fresco', 'Sopa de verduras con pollo'],
    ['Viernes', 'Yogur griego, granola y fresas', 'Fríjoles, arroz, aguacate y huevo', 'Naranja', 'Tilapia con verduras salteadas'],
    ['Sábado', 'Changua o huevos con pan integral', 'Sancocho de pollo', 'Yogur con maracuyá', 'Arepa con queso y ensalada'],
    ['Domingo', 'Pancakes de avena y banano', 'Carne asada, arroz y ensalada', 'Mango', 'Crema de verduras con huevo']
  ];

  D.LEGAL = 'Este diagnóstico es orientativo: se basa en tus respuestas y no es un diagnóstico médico. La Rutina Belleza de Adentro es un suplemento dietario: no es un medicamento ni reemplaza una alimentación balanceada. Si tienes una condición de salud, estás embarazada o tomas medicamentos, consulta a tu médico antes de cambiar tu rutina.';

  // ---------- Estado ----------
  D.ans = {};
  D.P = window.DIAG_PRODUCTS || {};
  D.variant = (window.DIAG_VARIANT || 'a');

  D.answer = function (id, v) { D.ans[id] = v; D.track('respuesta', id); };
  D.progress = function () { var n = 0; D.Q.forEach(function (q) { if (D.ans[q.id] != null && D.ans[q.id] !== '') n++; }); return n / D.Q.length; };

  D.scores = function () {
    var acc = {}, add = function (a, v) { (acc[a] = acc[a] || []).push(v); };
    D.Q.forEach(function (q) {
      if (!q.a || D.ans[q.id] == null) return;
      var opt = q.o[D.ans[q.id]]; if (!opt) return;
      if (q.a === 'mov2') { add('movilidad', opt[2]); add('energia', opt[2]); } else add(q.a, opt[2]);
    });
    var s = {}; Object.keys(D.AREAS).forEach(function (k) { var v = acc[k]; s[k] = v && v.length ? Math.round(v.reduce(function (x, y) { return x + y; }, 0) / v.length) : null; });
    return s;
  };
  D.index = function (s) { var v = Object.keys(s).map(function (k) { return s[k]; }).filter(function (x) { return x != null; }); return v.length ? Math.round(v.reduce(function (a, b) { return a + b; }, 0) / v.length) : 0; };
  D.profile = function (i) {
    if (i < 45) return { n: 'Tu cuerpo te está pidiendo una pausa', d: 'Varias áreas están en rojo al mismo tiempo. La buena noticia: casi todas dependen de hábitos que se mueven rápido cuando se atienden juntos.' };
    if (i < 65) return { n: 'Cuidado a medias: falta la parte de adentro', d: 'Haces cosas por tu belleza, pero hay hábitos que se quedan cortos. Con unos pocos ajustes diarios tu rutina queda completa.' };
    if (i < 80) return { n: 'En buen camino, con detalles por ajustar', d: 'Tienes una buena base. Hay dos o tres áreas que, si las atiendes, se van a notar.' };
    return { n: 'Base sólida: ahora toca sostenerla', d: 'Tus hábitos van muy bien. El reto es la constancia, y cuidarte por dentro para que se mantenga con los años.' };
  };
  D.color = function (v) { return v == null ? '#bbb' : v < 45 ? '#D3306A' : v < 70 ? '#E9A23B' : '#3E9B6E'; };
  D.label = function (v) { return v == null ? '—' : v < 45 ? 'Necesita atención' : v < 70 ? 'Mejorable' : 'Bien'; };
  D.lows = function (s, n) {
    var metas = D.ans.meta || [];
    return Object.keys(s).filter(function (k) { return s[k] != null; })
      .sort(function (a, b) { var pa = s[a] - (metas.indexOf(a) > -1 ? 8 : 0), pb = s[b] - (metas.indexOf(b) > -1 ? 8 : 0); return pa - pb; }).slice(0, n || 3);
  };

  // ---------- Productos argumentados ----------
  D.recos = function (s) {
    var r = [], P = D.P;
    if (P.rutina) r.push({ p: P.rutina, k: 'Base de tu rutina', w: 'Es tu cuidado por dentro: colágeno marino hidrolizado tipos 1 a 5 con vitamina E, y gomitas de nicotinamida (vitamina B3). Acompaña el cuidado de tu piel, tu cabello y tus uñas. Sabe a mango y uva, y así es fácil ser constante, que es lo que más importa.' });
    var opts = [
      ['sol', 'protector', 70, 'Tu protección solar está en ' + s.sol + '/100. El protector es el paso que más cuida la piel por fuera: el sol es la principal causa del envejecimiento visible. FPS 50 y toque seco, para todas las mañanas.'],
      ['piel', 'facial', 65, 'Tu piel está en ' + s.piel + '/100 y se siente apagada o reseca. Esta crema con rosa mosqueta y camelia la hidrata por fuera mientras la rutina trabaja por dentro.'],
      ['hidratacion', 'facial', 60, 'Tu hidratación está en ' + s.hidratacion + '/100. Además de tomar más agua, esta crema con rosa mosqueta y camelia ayuda a que la piel no se sienta tirante.'],
      ['cabello', 'capilar', 65, 'Tu cabello está en ' + s.cabello + '/100. Un tratamiento 10 en 1 ayuda a que se quiebre menos al peinarlo, mientras cuidas la proteína en tu comida.'],
      ['unas', 'manos', 65, 'Tus uñas están en ' + s.unas + '/100. Hidratar manos y cutículas cada noche las protege del agua y los jabones.']
    ].filter(function (o) { return P[o[1]] && s[o[0]] != null && s[o[0]] < o[2]; })
     .sort(function (x, y) { return s[x[0]] - s[y[0]]; });
    if (opts.length) r.push({ p: P[opts[0][1]], k: 'Para tu ' + D.AREAS[opts[0][0]].n.toLowerCase() + ' (' + s[opts[0][0]] + '/100)', w: opts[0][3], area: opts[0][0] });
    return r;
  };

  // ---------- Checkout directo (enlace de carrito de Shopify) ----------
  D.checkout = function (prods) {
    var v = prods.filter(function (p) { return p && p.vid; }).map(function (p) { return p.vid + ':1'; });
    return '/cart/' + v.join(',') + '?attributes[origen]=diagnostico-' + D.variant + '&utm_source=diagnostico&utm_medium=quiz&utm_campaign=diag-' + D.variant;
  };

  // ---------- Enlace para volver a ver el resultado (para el correo) ----------
  D.code = function () {
    var a = D.Q.filter(function (q) { return q.o && !q.multi; }).map(function (q) { return D.ans[q.id] == null ? 'x' : D.ans[q.id]; }).join('');
    var m = (D.ans.meta || []).map(function (k) { return Object.keys(D.AREAS).indexOf(k); }).join('');
    return a + '-' + m + '-' + encodeURIComponent((D.ans.nombre || '').split(' ')[0]);
  };
  D.fromCode = function (c) {
    try {
      var parts = c.split('-'), a = parts[0], i = 0, keys = Object.keys(D.AREAS), n = 0;
      D.Q.forEach(function (q) { if (q.o && !q.multi) { var ch = a.charAt(i++); if (ch && ch !== 'x' && q.o[+ch]) { D.ans[q.id] = +ch; n++; } } });
      D.ans.meta = (parts[1] || '').split('').filter(Boolean).map(function (x) { return keys[+x]; }).filter(Boolean);
      if (parts[2]) D.ans.nombre = decodeURIComponent(parts.slice(2).join('-'));
      return n >= 8;
    } catch (e) { return false; }
  };
  D.shareUrl = function () { return location.origin + location.pathname + '?r=' + D.code(); };

  // ---------- Rutina de mañana ----------
  D.tomorrow = function (s) {
    var t = [];
    t.push(['6:30 a. m.', '💧', 'Un vaso de agua al levantarte', 'Arrancas el día hidratada; es el primer vaso de tu meta de 6 a 8.']);
    t.push(['7:00 a. m.', '🍳', 'Desayuno con proteína + 2 gomitas sabor uva', 'Huevos pericos, arepa pequeña y papaya. La proteína y la fruta con vitamina C le dan a tu cuerpo con qué trabajar.']);
    t.push(['7:20 a. m.', '🧴', 'Protector solar FPS 50', (s.sol != null && s.sol < 70) ? 'Tu punto más bajo por fuera. Cara, cuello y manos, aunque esté nublado.' : 'Ya lo haces: sostenlo, y reaplica al mediodía si sales.']);
    t.push(['10:00 a. m.', '🍓', 'Media mañana: yogur con fresas', 'Un lácteo (calcio) y vitamina C en un solo snack.']);
    t.push(['12:30 p. m.', '🍗', 'Almuerzo: pechuga, arroz, ensalada y fríjoles', 'Proteína, hierro y verduras. Dos vasos de agua en la tarde.']);
    if (s.movilidad != null && s.movilidad < 70 || s.energia != null && s.energia < 70) t.push(['6:00 p. m.', '🚶‍♀️', 'Caminata de 20 a 30 minutos', 'Para tu movilidad y tu energía: los músculos fuertes protegen las rodillas.']);
    t.push(['7:30 p. m.', '🥣', 'Cena liviana: crema de ahuyama con queso', 'Cenar temprano y liviano ayuda a dormir mejor.']);
    t.push(['9:00 p. m.', '🥭', 'Tu vaso de colágeno sabor mango', 'El momento de tu rutina por dentro. ' + ((s.unas != null && s.unas < 65) ? 'Aprovecha y ponte crema en manos y cutículas.' : 'Dos minutos solo para ti.')]);
    t.push(['10:00 p. m.', '🌙', 'A dormir: meta de 7 a 8 horas', (s.descanso != null && s.descanso < 70) ? 'Tu descanso está bajo: celular fuera de la cama esta noche.' : 'Mantén la misma hora mañana.']);
    return t;
  };

  // ---------- Gráficas SVG ----------
  // Flor de belleza: cada pétalo es un área; entre más largo, mejor está. Reemplaza a la araña (2026-11-20).
  D.radar = function (s, size, bare) {
    size = size || 300; var keys = Object.keys(D.AREAS), n = keys.length, c = size / 2, R = bare ? size / 2 - 2 : size / 2 - 34, r0 = R * 0.22, w = R * (bare ? 0.2 : 0.18), g = '', p = '', ic = '', any = false;
    keys.forEach(function (k, i) {
      var d = i * 360 / n, v = s[k], rot = ' transform="rotate(' + d.toFixed(1) + ' ' + c + ' ' + c + ')"';
      g += '<ellipse cx="' + c + '" cy="' + (c - R / 2).toFixed(1) + '" rx="' + w.toFixed(1) + '" ry="' + (R / 2).toFixed(1) + '" fill="#efe1d9" fill-opacity=".55"' + rot + '/>';
      if (v != null) { any = true; var L = r0 + (R - r0) * v / 100; p += '<ellipse cx="' + c + '" cy="' + (c - L / 2).toFixed(1) + '" rx="' + (w - 1.5).toFixed(1) + '" ry="' + (L / 2).toFixed(1) + '" fill="' + D.color(v) + '" fill-opacity=".88"' + rot + '><title>' + D.AREAS[k].n + ': ' + v + ' de 100</title></ellipse>'; }
      if (!bare) { var a = (d - 90) * Math.PI / 180; ic += '<text x="' + (c + Math.cos(a) * (R + 18)).toFixed(1) + '" y="' + (c + Math.sin(a) * (R + 18) + 1).toFixed(1) + '" text-anchor="middle" dominant-baseline="middle" font-size="' + (size / 16).toFixed(0) + '">' + D.AREAS[k].i + '</text>'; }
    });
    var cr = R * 0.3, ctr = '<circle cx="' + c + '" cy="' + c + '" r="' + cr.toFixed(1) + '" fill="#fff" stroke="#f0e2d8" stroke-width="2"/>';
    if (!bare) ctr += '<text class="fc" x="' + c + '" y="' + (c + 2) + '" text-anchor="middle" font-family="Montserrat,Arial" font-weight="800" font-size="' + (cr * 0.7).toFixed(0) + '" fill="#121212">' + (any ? D.index(s) : '—') + '</text><text class="fc2" x="' + c + '" y="' + (c + cr * 0.55).toFixed(1) + '" text-anchor="middle" font-family="Inter,Arial" font-size="' + Math.max(8, cr * 0.26).toFixed(0) + '" fill="#7a6a66">de 100</text>';
    return '<svg viewBox="0 0 ' + size + ' ' + size + '" width="100%" role="img" aria-label="Tu flor de belleza: 9 áreas">' + g + p + ctr + ic + '</svg>';
  };
  D.legend = '<div class="dg-legend"><span><i style="background:#D3306A"></i>Necesita atención</span><span><i style="background:#E9A23B"></i>Mejorable</span><span><i style="background:#3E9B6E"></i>Bien</span></div>';
  D.gauge = function (v, size) {
    size = size || 170; var r = size / 2 - 14, c = size / 2, L = Math.PI * r, f = v / 100;
    return '<svg viewBox="0 0 ' + size + ' ' + (size / 2 + 22) + '" width="100%"><path d="M14 ' + c + ' A' + r + ' ' + r + ' 0 0 1 ' + (size - 14) + ' ' + c + '" fill="none" stroke="#f0e2d8" stroke-width="14" stroke-linecap="round"/>' +
      '<path d="M14 ' + c + ' A' + r + ' ' + r + ' 0 0 1 ' + (size - 14) + ' ' + c + '" fill="none" stroke="' + D.color(v) + '" stroke-width="14" stroke-linecap="round" stroke-dasharray="' + (L * f).toFixed(1) + ' ' + L.toFixed(1) + '"/>' +
      '<text x="' + c + '" y="' + (c - 4) + '" text-anchor="middle" font-family="Montserrat,Arial" font-weight="800" font-size="' + (size / 4.2).toFixed(0) + '" fill="#121212">' + v + '</text>' +
      '<text x="' + c + '" y="' + (c + 16) + '" text-anchor="middle" font-family="Inter,Arial" font-size="11" fill="#7a6a66">de 100</text></svg>';
  };
  D.bars = function (s) {
    return '<div class="dg-bars">' + Object.keys(D.AREAS).map(function (k) { var v = s[k]; return '<div class="dg-bar"><span class="dg-bar-l">' + D.AREAS[k].i + ' ' + D.AREAS[k].n + '</span><span class="dg-bar-t"><i style="width:' + (v || 0) + '%;background:' + D.color(v) + '"></i></span><b style="color:' + D.color(v) + '">' + (v == null ? '—' : v) + '</b></div>'; }).join('') + '</div>';
  };

  // ---------- Resultados en pantalla ----------
  D.money = function (p) { return p && p.price ? p.price : ''; };
  D.renderResults = function (el) {
    var s = D.scores(), idx = D.index(s), pf = D.profile(idx), lows = D.lows(s, 3), rec = D.recos(s), name = esc((D.ans.nombre || '').split(' ')[0]);
    var main = rec[0], extra = rec[1], h = '';
    // 1. resumen
    h += '<section class="dg-r-hero"><p class="dg-kicker">Tu diagnóstico de belleza</p><div class="dg-sum"><div class="dg-sum-g">' + D.gauge(idx, 150) + '</div><div><h2>' + (name ? name + ', ' : '') + esc(pf.n.charAt(0).toLowerCase() + pf.n.slice(1)) + '</h2><p>' + esc(pf.d) + '</p></div></div>' +
      '<div class="dg-chips">' + lows.map(function (k, i) { return '<span style="--c:' + D.color(s[k]) + '"><b>' + (i + 1) + '</b>' + D.AREAS[k].i + ' ' + D.AREAS[k].n + ' · ' + s[k] + '</span>'; }).join('') + '</div></section>';
    // 2. mapa
    h += '<section class="dg-r-map dg-card"><div class="dg-map-r"><h3>Tu flor de belleza</h3><p class="dg-muted">Cada pétalo es un área. Entre más largo, mejor está.</p>' + D.radar(s) + D.legend + '</div><details class="dg-more"><summary>Ver cada área con su puntaje</summary>' + D.bars(s) + '</details></section>';
    // 3. prioridades en acordeón
    h += '<section class="dg-r-pri"><h3 class="dg-h">Tus 3 prioridades</h3><div class="dg-acc">' + lows.map(function (k, i) { var T = D.TXT[k]; return '<details class="dg-card dg-acc-i"' + (i === 0 ? ' open' : '') + '><summary><span class="dg-acc-n" style="background:' + D.color(s[k]) + '">' + s[k] + '</span><span><b>' + D.AREAS[k].i + ' ' + D.AREAS[k].n + '</b><small>' + D.label(s[k]) + ' · toca para ver</small></span></summary><p>' + esc(T.por) + '</p><ul>' + T.h.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></details>'; }).join('') + '</div></section>';
    // 4. mañana, compacto
    var tl = D.tomorrow(s);
    h += '<section class="dg-r-tl"><h3 class="dg-h">Tu rutina para mañana</h3><p class="dg-muted">Toca cada paso para ver por qué.</p><div class="dg-tl2">' + tl.map(function (r, i) { return '<details' + (i > 4 ? ' class="dg-tl-more"' : '') + '><summary><span class="t">' + r[0] + '</span><span class="i">' + r[1] + '</span><b>' + esc(r[2]) + '</b></summary><p>' + esc(r[3]) + '</p></details>'; }).join('') + '</div>' + (tl.length > 5 ? '<button type="button" class="dg-link" data-tlmore>Ver el día completo (' + tl.length + ' pasos)</button>' : '') + '</section>';
    // 5. semana con pestañas por día
    h += '<section class="dg-r-plan"><h3 class="dg-h">Tu semana de comidas</h3><p class="dg-muted">Comida colombiana, con proteína en cada comida.</p><div class="dg-days" role="tablist">' + D.PLAN.map(function (d, i) { return '<button type="button" role="tab" data-day="' + i + '"' + (i === 0 ? ' class="on"' : '') + '>' + d[0].slice(0, 3) + '</button>'; }).join('') + '</div><div class="dg-day dg-card" data-dayview></div></section>';
    // 6. PDF
    h += '<section class="dg-r-cta dg-card"><h3>Tu diagnóstico completo en PDF</h3><p class="dg-muted">6 páginas: tablero, prioridades explicadas, rutina hora por hora, semana de comidas y recomendación.</p><button class="dg-btn dg-btn-big" type="button" data-pdf>Descargar mi PDF</button><p class="dg-muted" data-mailmsg>' + (D.ans.email ? 'También te lo enviamos a ' + esc(D.ans.email) + '.' : '') + '</p></section>';
    // 7. recomendación (al final, después de todo el valor): máximo 2 productos, botones directo al checkout
    if (main) {
      h += '<section class="dg-r-prod" id="dgProd"><h3 class="dg-h">Lo que te recomendamos</h3><article class="dg-card dg-main"><div class="dg-main-img"><img src="' + esc(main.p.img) + '" alt="' + esc(main.p.title) + '" loading="lazy"></div><div class="dg-main-b"><span class="dg-tag">' + esc(main.k) + '</span><h4>' + esc(main.p.title) + '</h4><p>' + esc(main.w) + '</p><ul class="dg-ticks"><li>Colágeno sabor mango, 1 litro</li><li>60 gomitas sabor uva</li><li>Guía de alimentación de regalo</li></ul><div class="dg-buy"><b>' + esc(main.p.price) + '</b><span>Pagas al recibir</span></div><a class="dg-btn dg-btn-big" data-track="checkout" href="' + D.checkout([main.p]) + '">Pedir mi rutina</a></div></article>';
      if (extra) h += '<article class="dg-card dg-extra"><div class="dg-extra-top"><img src="' + esc(extra.p.img) + '" alt="' + esc(extra.p.title) + '" loading="lazy"><div><span class="dg-tag">' + esc(extra.k) + '</span><h4>' + esc(extra.p.title) + '</h4><b>+ ' + esc(extra.p.price) + '</b></div></div><p>' + esc(extra.w) + '</p><a class="dg-btn dg-btn-ghost dg-btn-big" data-track="checkout" href="' + D.checkout([main.p, extra.p]) + '">Pedir la rutina + este producto</a></article>';
      h += '</section>';
    }
    h += '<p class="dg-legal">' + esc(D.LEGAL) + '</p>';
    if (main) h += '<div class="dg-sticky" data-sticky hidden><div><b>' + esc(main.p.price) + '</b><span>Rutina Belleza de Adentro · pagas al recibir</span></div><a class="dg-btn" data-track="checkout" href="' + D.checkout([main.p]) + '">Pedir mi rutina</a></div>';
    el.innerHTML = h; el.hidden = false;
    var b = el.querySelector('[data-pdf]'); if (b) b.addEventListener('click', function () { D.pdf(b); });
    var view = el.querySelector('[data-dayview]'), showDay = function (i) { var d = D.PLAN[i]; view.innerHTML = [['☀️', 'Desayuno', d[1] + ' + 2 gomitas sabor uva'], ['🍽️', 'Almuerzo', d[2]], ['🍎', 'Algo', d[3]], ['🌙', 'Cena', d[4] + '. En la noche, tu vaso de colágeno sabor mango.']].map(function (m) { return '<div class="dg-meal"><span class="i">' + m[0] + '</span><div><small>' + m[1] + '</small><p>' + esc(m[2]) + '</p></div></div>'; }).join(''); [].forEach.call(el.querySelectorAll('[data-day]'), function (x) { x.classList.toggle('on', +x.dataset.day === i); }); };
    [].forEach.call(el.querySelectorAll('[data-day]'), function (x) { x.addEventListener('click', function () { showDay(+x.dataset.day); }); }); showDay(0);
    var more = el.querySelector('[data-tlmore]'); if (more) more.addEventListener('click', function () { el.querySelector('.dg-tl2').classList.add('all'); more.remove(); });
    [].forEach.call(el.querySelectorAll('[data-track=checkout]'), function (a) { a.addEventListener('click', function () { D.track('checkout', a.textContent); }); });
    // barra fija de compra: aparece al bajar y se esconde cuando ya se ve la recomendación (que está al final)
    var st = el.querySelector('[data-sticky]'), prod = el.querySelector('#dgProd');
    if (st && prod) { var onS = function () { var r = prod.getBoundingClientRect(); st.hidden = !(window.scrollY > 500 && r.top > window.innerHeight); }; window.addEventListener('scroll', onS, { passive: true }); onS(); }
    D.track('resultado', 'idx-' + idx);
  };

  // si la página abre con ?r=… (enlace del correo), muestra el resultado directo
  document.addEventListener('DOMContentLoaded', function () {
    var m = location.search.match(/[?&]r=([^&]+)/); if (!m || !D.fromCode(decodeURIComponent(m[1]))) return;
    [].forEach.call(document.querySelectorAll('[data-flow]'), function (x) { x.hidden = true; });
    var el = document.querySelector('.dg-results'); if (el) { D.renderResults(el); window.scrollTo(0, 0); D.track('reabrir', 'correo'); }
    // ?pdf=1 (botón "Descargar mi PDF" del correo): baja el PDF solo
    if (el && /[?&]pdf=1/.test(location.search)) setTimeout(function () { var b = [].filter.call(el.querySelectorAll('button'), function (x) { return /PDF/i.test(x.textContent); })[0]; D.pdf(b || null); }, 900);
  });

  // ---------- PDF ----------
  D.reportHTML = function () {
    var s = D.scores(), idx = D.index(s), pf = D.profile(idx), lows = D.lows(s, 3), rec = D.recos(s), name = esc(D.ans.nombre || ''), hoy = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
    var pg = function (inner, cls) { return '<div class="pdf-page ' + (cls || '') + '">' + inner + '<div class="pdf-foot">Belleza Frenesí · bellezafrenesi.co · Diagnóstico de belleza por dentro</div></div>'; };
    var h = '';
    h += pg('<div class="pdf-cover"><p class="pdf-brand">Belleza Frenesí</p><h1>Diagnóstico de<br><em>belleza por dentro</em></h1><p class="pdf-for">Preparado para <b>' + (name || 'ti') + '</b><br>' + hoy + '</p><div class="pdf-cover-g">' + D.gauge(idx, 260) + '<p>Índice de belleza por dentro</p></div><h2>' + esc(pf.n) + '</h2><p class="pdf-lead">' + esc(pf.d) + '</p><div class="pdf-index"><b>En este informe</b><ol><li>Tu tablero de 9 áreas y tus respuestas</li><li>Tus 3 prioridades, explicadas</li><li>Tu rutina de mañana, hora por hora</li><li>Tu semana de comidas sugerida</li>' + (rec.length ? '<li>Lo que te recomendamos y por qué</li>' : '') + '</ol></div></div>', 'pdf-p-cover');
    h += pg('<h2 class="pdf-h">1. Tu tablero</h2><p class="pdf-lead">Medimos 9 áreas que se ven en el espejo y en la energía del día. Cada una va de 0 a 100 según tus respuestas.</p><div class="pdf-dash"><div>' + D.radar(s, 320) + '</div><div>' + D.bars(s) + '</div></div><div class="pdf-legend"><span><i style="background:#D3306A"></i>0–44 Necesita atención</span><span><i style="background:#E9A23B"></i>45–69 Mejorable</span><span><i style="background:#3E9B6E"></i>70–100 Bien</span></div><h3 class="pdf-h3">Tus respuestas</h3><table class="pdf-ans">' + D.Q.filter(function (q) { return q.o && D.ans[q.id] != null; }).map(function (q) { var v = D.ans[q.id]; var t = q.multi ? (v || []).map(function (x) { return (q.o.find(function (o) { return o[2] === x; }) || [''])[0]; }).join(', ') : q.o[v][0]; return '<tr><td>' + esc(q.t) + '</td><td><b>' + esc(t) + '</b></td></tr>'; }).join('') + '</table>');
    h += pg('<h2 class="pdf-h">2. Tus prioridades, explicadas</h2>' + lows.map(function (k, i) { var T = D.TXT[k]; return '<div class="pdf-pri"><div class="pdf-pri-n" style="background:' + D.color(s[k]) + '">' + s[k] + '</div><div><h3>' + (i + 1) + '. ' + D.AREAS[k].n + ' · ' + D.label(s[k]) + '</h3><p><b>Por qué pasa.</b> ' + esc(T.por) + '</p><p><b>Qué hacer desde mañana:</b></p><ul>' + T.h.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div></div>'; }).join('') + '<h3 class="pdf-h3">Las demás áreas</h3><div class="pdf-mini">' + Object.keys(D.AREAS).filter(function (k) { return lows.indexOf(k) < 0 && s[k] != null; }).map(function (k) { return '<div><b>' + D.AREAS[k].i + ' ' + D.AREAS[k].n + ' · ' + s[k] + '</b><span>' + esc(D.TXT[k].h[0]) + '</span></div>'; }).join('') + '</div>');
    h += pg('<h2 class="pdf-h">3. Tu rutina de mañana, hora por hora</h2><ol class="pdf-tl">' + D.tomorrow(s).map(function (r) { return '<li><span>' + r[0] + '</span><b>' + r[1] + ' ' + esc(r[2]) + '</b><p>' + esc(r[3]) + '</p></li>'; }).join('') + '</ol><h3 class="pdf-h3">Tus 6 hábitos base</h3><div class="pdf-hab"><div>💧<b>6 a 8 vasos de agua</b></div><div>🍳<b>Proteína en las 3 comidas</b></div><div>🍊<b>Fruta con vitamina C a diario</b></div><div>🥛<b>2 o 3 lácteos al día</b></div><div>🧴<b>Protector solar cada mañana</b></div><div>🌙<b>7 a 8 horas de sueño</b></div></div>');
    h += pg('<h2 class="pdf-h">4. Tu semana de comidas sugerida</h2><p class="pdf-lead">Comida colombiana y sencilla, con proteína en cada comida, frutas con vitamina C y lácteos. Ajusta las porciones a tu hambre.</p><table class="pdf-plan"><thead><tr><th></th><th>Desayuno</th><th>Almuerzo</th><th>Algo</th><th>Cena</th></tr></thead><tbody>' + D.PLAN.map(function (d) { return '<tr><th>' + d[0] + '</th><td>' + d[1] + '<small>+ 2 gomitas sabor uva</small></td><td>' + d[2] + '</td><td>' + d[3] + '</td><td>' + d[4] + '<small>+ vaso de colágeno sabor mango en la noche</small></td></tr>'; }).join('') + '</tbody></table><p class="pdf-note">Si tienes una dieta especial por una condición de salud, sigue la de tu médico o nutricionista.</p>');
    if (rec.length) h += pg('<h2 class="pdf-h">5. Lo que te recomendamos y por qué</h2>' + rec.map(function (r, i) { return '<div class="pdf-prod' + (i === 0 ? ' pdf-prod-main' : '') + '"><img src="' + esc(r.p.img) + '" crossorigin="anonymous"><div><small>' + esc(r.k) + '</small><h3>' + esc(r.p.title) + '</h3><p>' + esc(r.w) + '</p><b>' + esc(r.p.price) + '</b> · <span>bellezafrenesi.co' + esc(r.p.url) + '</span></div></div>'; }).join('') + '<p class="pdf-legal">' + esc(D.LEGAL) + '</p>');
    return h;
  };
  D.pdf = function (btn) {
    var txt = btn ? btn.textContent : ''; if (btn) { btn.disabled = true; btn.textContent = 'Preparando tu PDF…'; }
    var go = function () {
      var off = document.createElement('div'); off.className = 'pdf-off'; var host = document.createElement('div'); host.className = 'pdf-host'; host.innerHTML = D.reportHTML(); off.appendChild(host); document.body.appendChild(off);
      var nm = (D.ans.nombre || 'mi').split(' ')[0].replace(/[^\wáéíóúñ]/gi, '');
      window.html2pdf().set({ margin: 0, filename: 'Diagnostico-belleza-' + nm + '.pdf', image: { type: 'jpeg', quality: 0.95 }, html2canvas: { scale: 1.7, useCORS: true, backgroundColor: '#ffffff' }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }, pagebreak: { mode: ['css'], after: '.pdf-page:not(:last-child)' } })
        .from(host).save().then(function () { off.remove(); if (btn) { btn.disabled = false; btn.textContent = txt; } D.track('pdf', 'descarga'); })
        .catch(function () { off.remove(); if (btn) { btn.disabled = false; btn.textContent = txt; } });
    };
    if (window.html2pdf) go(); else { var sc = document.createElement('script'); sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'; sc.onload = go; document.head.appendChild(sc); }
  };

  // ---------- Correo: crea la clienta en Shopify (suscrita a marketing) con etiquetas ----------
  D.armCaptcha = function () { var form = document.getElementById('dgCust'); if (form && !form.dataset.dgArmed && window.Shopify && window.Shopify.captcha) { form.dataset.dgArmed = 1; try { window.Shopify.captcha.protect(form); } catch (e) { } } };
  D.saveEmail = function (email, whatsapp) {
    D.ans.email = email; var s = D.scores(), idx = D.index(s), lows = D.lows(s, 3);
    var tags = ['diagnostico', 'diag-' + D.variant, 'diag-indice-' + (idx < 45 ? 'bajo' : idx < 65 ? 'medio' : idx < 80 ? 'bueno' : 'alto')].concat(lows.map(function (k) { return 'diag-prioridad-' + k; }));
    // para el correo: código del resultado (sin nombre), índice exacto y complemento recomendado
    var cp = D.code().split('-'); tags.push('diagr-' + cp[0] + '-' + cp[1]); tags.push('diagn-' + idx); tags.push('diagp-' + D.variant + '-' + idx + '-' + lows.join('-'));
    var rc = D.recos(s); if (rc[1]) Object.keys(D.P).forEach(function (k) { if (D.P[k] === rc[1].p) tags.push('diagx-' + k); });
    var f = new FormData(); f.append('form_type', 'customer'); f.append('utf8', '✓'); f.append('contact[email]', email); f.append('contact[tags]', tags.join(','));
    if (D.ans.nombre) f.append('contact[first_name]', D.ans.nombre);
    f.append('contact[note]', (whatsapp ? 'WhatsApp: ' + whatsapp + ' | ' : '') + 'Diagnóstico ' + idx + '/100: ' + D.shareUrl());
    D.track('correo', 'enviado');
    var form = document.getElementById('dgCust');
    if (!form || !window.Shopify || !window.Shopify.captcha) return fetch('/contact', { method: 'POST', body: f, credentials: 'same-origin' }).then(function (r) { return r.ok; }).catch(function () { return false; });
    form.querySelector('[name="contact[email]"]').value = email;
    form.querySelector('[name="contact[first_name]"]').value = D.ans.nombre || '';
    form.querySelector('[name="contact[tags]"]').value = tags.join(',');
    form.querySelector('[name="contact[note]"]').value = f.get('contact[note]');
    D.armCaptcha();
    return new Promise(function (res) {
      var done = false, fin = function (v) { if (!done) { done = true; res(v); } };
      setTimeout(function () { fin(false); }, 15000);
      // Con el token del captcha, Shopify reenvía el formulario (con submit() o con un submit normal): lo atajamos y lo enviamos en segundo plano
      if (!form.dataset.dgHook) {
        form.dataset.dgHook = 1;
        form.addEventListener('submit', function (e) {
          var tk = form.elements['h-captcha-response'];
          if (tk && tk.value && form._dgSend) { e.preventDefault(); e.stopImmediatePropagation(); form._dgSend(); }
        }, true);
      }
      // red de seguridad: si Shopify envía el formulario de forma normal, va a un iframe oculto y la página no se recarga
      var sink = document.getElementById('dgSink');
      if (sink) { form.target = 'dgSink'; sink.onload = function () { if (sink.dataset.armed) { form._dgSend = null; fin(true); } }; sink.dataset.armed = 1; }
      if (form.elements['h-captcha-response']) form.elements['h-captcha-response'].value = '';
      form._dgSend = function () { form._dgSend = null; send(); };
      form.submit = function () { if (form._dgSend) form._dgSend(); };
      function send() {
        fetch('/contact', { method: 'POST', body: new FormData(form), credentials: 'same-origin' }).then(function (r) {
          if (/\/challenge/.test(r.url)) {
            // Shopify pide resolver el captcha a la vista: la mandamos ahí y vuelve a su resultado
            D.track('correo', 'captcha');
            var u = new URL(r.url); u.searchParams.set('return_path', location.pathname + '?r=' + D.code()); location.href = u.toString(); return;
          }
          fin(r.ok);
        }).catch(function () { fin(false); });
      }
      var tries = 0;
      (function go() { if (form.dataset.hcaptchaBound || tries++ > 16) { form.requestSubmit ? form.requestSubmit() : form.submit(); } else setTimeout(go, 400); })();
    });
  };

  D.track = function (ev, label) { try { if (window.fbq) window.fbq('trackCustom', 'Diagnostico_' + ev, { variante: D.variant, paso: label }); if (window.Shopify && window.Shopify.analytics && window.Shopify.analytics.publish) window.Shopify.analytics.publish('diagnostico_' + ev, { variante: D.variant, paso: label }); } catch (e) { } };

  // ---------- Pantalla de correo reutilizable ----------
  D.emailForm = function (onDone, cls) {
    var w = document.createElement('form'); w.className = 'dg-email ' + (cls || ''); w.noValidate = true; D.armCaptcha();
    w.innerHTML = '<label>Tu correo<input type="email" name="email" required autocomplete="email" placeholder="tucorreo@ejemplo.com"></label><label><span class="lt">WhatsApp <span>(opcional)</span></span><input type="tel" name="wa" autocomplete="tel" inputmode="tel" placeholder="300 123 4567"></label><label class="dg-check"><input type="checkbox" name="ok" checked> Acepto recibir mi diagnóstico y consejos de Belleza Frenesí por correo. Puedo darme de baja cuando quiera.</label><button class="dg-btn dg-btn-big" type="submit">Ver mi diagnóstico</button><p class="dg-err" hidden>Revisa tu correo: parece que falta algo.</p>';
    w.addEventListener('submit', function (e) {
      e.preventDefault(); var em = w.email.value.trim(), ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em);
      if (!ok || !w.ok.checked) { w.querySelector('.dg-err').hidden = false; return; }
      var b = w.querySelector('button'); b.disabled = true; b.textContent = 'Calculando tu diagnóstico…';
      D.saveEmail(em, w.wa.value.trim()).then(function () { onDone(); });
    });
    return w;
  };
})();
