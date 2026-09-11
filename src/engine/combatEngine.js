/**
 * Tile Kings - Combat Engine
 * Manages deterministic combat resolution: Damage = max(0, ATK - DEF), defender response windows,
 * capture movements, knockbacks, and Regicide victory triggers.
 */

/**
 * Creates an initial combat state object for an attack declaration.
 * @param {Object} attacker Unit declaring attack
 * @param {Object} defender Target unit
 * @param {Object} attackProfile Selected attack profile
 * @param {number} attackerFireManaSpent Fire mana spent for +1 ATK each
 * @param {Array<Object>} attackerBuffSpells List of offensive spell cards played
 */
export function createCombatDeclaration(attacker, defender, attackProfile, attackerFireManaSpent = 0, attackerBuffSpells = []) {
  let baseAttackValue = attackProfile.attackValue;

  // Calculate attacker buffs
  let bonusAttack = attackerFireManaSpent; // 1 Fire Mana = +1 ATK
  attackerBuffSpells.forEach(spell => {
    if (spell.effect && spell.effect.type === 'BUFF_ATTACK') {
      bonusAttack += spell.effect.amount;
    }
  });

  // Check if attacker has Empower status
  if (attacker.statuses && attacker.statuses.includes('empower')) {
    bonusAttack += 2;
  }

  const totalDeclaredAttack = baseAttackValue + bonusAttack;

  return {
    attackerId: attacker.id,
    defenderId: defender.id,
    attackProfile,
    baseAttackValue,
    attackerFireManaSpent,
    attackerBuffSpells,
    totalDeclaredAttack,
    // Defensive response state
    defenderResponse: null, // Populated during reaction window
    defenderEarthManaSpent: 0,
    defenderSpellsPlayed: [],
    resolved: false
  };
}

/**
 * Resolves declared combat after defender's response opportunity.
 * Formula: Damage Received = max(0, Total Attack - Total Defense)
 * @param {Object} combatDeclaration Current combat declaration object
 * @param {Object} piecesMap Global pieces map
 * @param {Function} logCallback Log callback for combat audit trail
 * @returns {Object} { damage, targetCaptured, attackerMoved, knockbackApplied, regicideTriggered, winner }
 */
export function resolveCombat(combatDeclaration, piecesMap, logCallback = () => {}) {
  const attacker = piecesMap[combatDeclaration.attackerId];
  const defender = piecesMap[combatDeclaration.defenderId];
  const profile = combatDeclaration.attackProfile;

  if (!attacker || !defender) {
    return { error: 'Attacker or defender no longer exists.' };
  }

  // Calculate Defender Defense
  let baseDefense = defender.defense;
  let bonusDefense = combatDeclaration.defenderEarthManaSpent; // 1 Earth Mana = +1 DEF

  combatDeclaration.defenderSpellsPlayed.forEach(spell => {
    if (spell.effect && spell.effect.type === 'BUFF_DEFENSE') {
      bonusDefense += spell.effect.amount;
    }
  });

  // Check Defender status (e.g. defended status)
  if (defender.statuses && defender.statuses.includes('defended')) {
    bonusDefense += 3;
  }

  const totalDefense = baseDefense + bonusDefense;
  let totalAttack = combatDeclaration.totalDeclaredAttack;

  // Check if any defender spell reduced attack (e.g. Gale Deflection)
  combatDeclaration.defenderSpellsPlayed.forEach(spell => {
    if (spell.effect && spell.effect.type === 'REDUCE_ATTACK') {
      totalAttack = Math.max(0, totalAttack - spell.effect.amount);
    }
  });

  // Universal damage formula
  const rawDamage = totalAttack - totalDefense;
  const finalDamage = Math.max(0, rawDamage);

  logCallback(
    `⚔️ COMBAT RESOLUTION: ${attacker.owner.toUpperCase()} ${attacker.name} attacks ${defender.owner.toUpperCase()} ${defender.name} with ${profile.name}!`
  );
  logCallback(
    `📊 Formula: ATK ${totalAttack} (Base ${profile.attackValue} + Buffs ${totalAttack - profile.attackValue}) - DEF ${totalDefense} (Base ${defender.defense} + Buffs ${bonusDefense}) = ${finalDamage} Damage.`
  );

  // Apply damage
  defender.hp = Math.max(0, defender.hp - finalDamage);

  let targetCaptured = false;
  let attackerMoved = false;
  let knockbackApplied = false;
  let regicideTriggered = false;
  let winner = null;

  if (defender.hp <= 0) {
    targetCaptured = true;
    logCallback(`💥 ${defender.owner.toUpperCase()} ${defender.name} reaches 0 HP and is CAPTURED!`);

    // Regicide check: if defender is a King piece
    if (defender.type === 'king') {
      regicideTriggered = true;
      winner = attacker.owner;
      logCallback(`👑 REGICIDE! ${attacker.owner.toUpperCase()} has slain the enemy King and won the game!`);
    }

    // Capture Movement: attacker moves to target square if profile allows
    if (profile.captureMovement) {
      attacker.x = defender.x;
      attacker.y = defender.y;
      attackerMoved = true;
      logCallback(`🏃 ${attacker.name} advances into the captured tile (${attacker.x}, ${attacker.y}).`);
    }
  } else {
    logCallback(`🛡️ ${defender.name} survives with ${defender.hp}/${defender.maxHP} HP.`);

    // Knockback handling if defender survived
    if (profile.knockback > 0) {
      const dx = Math.sign(defender.x - attacker.x);
      const dy = Math.sign(defender.y - attacker.y);
      const kx = defender.x + dx * profile.knockback;
      const ky = defender.y + dy * profile.knockback;

      // Check if tile is in bounds and unassigned
      const occupied = Object.values(piecesMap).some(p => p.x === kx && p.y === ky && p.hp > 0);
      if (kx >= 0 && kx < 12 && ky >= 0 && ky < 12 && !occupied) {
        defender.x = kx;
        defender.y = ky;
        knockbackApplied = true;
        logCallback(`💥 ${defender.name} is knocked back to (${kx}, ${ky})!`);
      }
    }
  }

  combatDeclaration.resolved = true;

  return {
    damage: finalDamage,
    targetCaptured,
    attackerMoved,
    knockbackApplied,
    regicideTriggered,
    winner
  };
}
