export function addChatListeners(html) {
    html.on('click', "button.parry", onParry);
}

function onParry(event) {
    const card = event.currentTarget.closest(".attack");
    let attacker = game.actors.get(card.dataset.ownerId);
    let attack = attacker.getOwnedItem(card.dataset.attackId);
    attack.roll();
}