// ============================================================================
// KOLIZJE W POZIOMIE (koła i prostokąty), GRANICA ŚWIATA, LINIA WZROKU, DOMKI
// ============================================================================
import { boxColliders, circleColliders, houseZones } from './swiat.js';
import { WORLD_RADIUS } from './stan.js';

export function resolveWorldCollisions(pos, radius) {
    const r = Math.hypot(pos.x, pos.z);
    const limit = WORLD_RADIUS - radius;
    if (r > limit) {
        pos.x *= limit / r;
        pos.z *= limit / r;
    }

    for (let i = 0; i < boxColliders.length; i++) {
        const b = boxColliders[i];
        if (pos.x < b.minX - radius || pos.x > b.maxX + radius || pos.z < b.minZ - radius || pos.z > b.maxZ + radius) continue;
        const closestX = Math.max(b.minX, Math.min(pos.x, b.maxX));
        const closestZ = Math.max(b.minZ, Math.min(pos.z, b.maxZ));
        const dx = pos.x - closestX;
        const dz = pos.z - closestZ;
        const distSq = dx * dx + dz * dz;
        if (distSq < radius * radius) {
            const dist = Math.sqrt(distSq);
            if (dist > 0.0001) {
                const push = (radius - dist) / dist;
                pos.x += dx * push;
                pos.z += dz * push;
            } else {
                // środek w prostokącie – wypychamy najkrótszą drogą
                const left = pos.x - b.minX, right = b.maxX - pos.x, top = pos.z - b.minZ, bottom = b.maxZ - pos.z;
                const m = Math.min(left, right, top, bottom);
                if (m === left) pos.x = b.minX - radius;
                else if (m === right) pos.x = b.maxX + radius;
                else if (m === top) pos.z = b.minZ - radius;
                else pos.z = b.maxZ + radius;
            }
        }
    }

    for (let i = 0; i < circleColliders.length; i++) {
        const ob = circleColliders[i];
        const dx = pos.x - ob.x;
        const dz = pos.z - ob.z;
        const minDist = radius + ob.radius;
        if (Math.abs(dx) > minDist || Math.abs(dz) > minDist) continue;
        const distSq = dx * dx + dz * dz;
        if (distSq < minDist * minDist && distSq > 0.0001) {
            const dist = Math.sqrt(distSq);
            const push = (minDist - dist) / dist;
            pos.x += dx * push;
            pos.z += dz * push;
        }
    }
}

// Czy odcinek A→B (na płasko) przecina ścianę lub inną przeszkodę prostokątną?
export function segmentBlocked(ax, az, bx, bz) {
    const dx = bx - ax, dz = bz - az;
    for (let i = 0; i < boxColliders.length; i++) {
        const b = boxColliders[i];
        let t0 = 0, t1 = 1;
        if (Math.abs(dx) < 1e-6) {
            if (ax < b.minX || ax > b.maxX) continue;
        } else {
            let ta = (b.minX - ax) / dx, tb = (b.maxX - ax) / dx;
            if (ta > tb) [ta, tb] = [tb, ta];
            t0 = Math.max(t0, ta); t1 = Math.min(t1, tb);
            if (t0 > t1) continue;
        }
        if (Math.abs(dz) < 1e-6) {
            if (az < b.minZ || az > b.maxZ) continue;
        } else {
            let ta = (b.minZ - az) / dz, tb = (b.maxZ - az) / dz;
            if (ta > tb) [ta, tb] = [tb, ta];
            t0 = Math.max(t0, ta); t1 = Math.min(t1, tb);
            if (t0 > t1) continue;
        }
        return true;
    }
    return false;
}

export function houseAt(x, z) {
    for (let i = 0; i < houseZones.length; i++) {
        const h = houseZones[i];
        if (x >= h.minX && x <= h.maxX && z >= h.minZ && z <= h.maxZ) return h;
    }
    return null;
}
