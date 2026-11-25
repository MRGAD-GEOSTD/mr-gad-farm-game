# مزرعة مستر جاد (Mr. Gad's Farm)

لعبة تعليمية تفاعلية لدرس «النشاط الزراعي في وطننا العربي» (الصف السادس الابتدائي).
An interactive Arabic learning game for the Grade 6 lesson "Agricultural activity in the Arab world". React + TypeScript + Vite, no backend.

## المراحل / Levels
1. **مصادر المياه**: drag places onto rivers / groundwater / rain.
2. **مقومات الزراعة**: natural vs human requirements, 50-second timer.
3. **سوق المحاصيل**: real-time falling cards, sort into grain / sugar / fiber crops (3 lives).
4. **مزرعة المشكلات**: farm simulation, 6 seasons, drag the right solution onto the farm before time runs out.

Stars per level (12 max). Levels unlock one after another.

## Run
```bash
npm install
npm run dev      # local dev server
npm run build    # static site in dist/ (host on GitHub Pages / Netlify)
```

## Where things are
- `src/App.tsx`: menu, levels, stars, level data for levels 1 and 2 (edit the `WATER_*` and `REQ_*` arrays).
- `src/SortGame.tsx`: generic drag-to-bucket game (levels 1 and 2).
- `src/CropGame.tsx`: falling-cards game loop (`CARDS`, speed, lives, goal).
- `src/FarmGame.tsx`: the farm simulation (`PROBLEMS` and `SOL`: each problem lists the accepted solutions).
- `src/drag.tsx`: pointer-events drag and drop that works with mouse and touch.
- `src/icons.tsx`: SVG icons (no images, no emoji).

Content comes from the lesson slides, not re-checked against the textbook pages. Please review the problem-to-solution pairings in `FarmGame.tsx`.
