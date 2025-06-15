import React from 'react';
import QuestModal from './QuestModal';
import SubquestModal from './SubquestModal';
import ShopModal from './ShopModal';
import InventoryModal from './InventoryModal';

const Modals = ({
  showQuestModal,
  setShowQuestModal,
  currentQuestType,
  onQuestConfirm,
  showSubquestModal,
  setShowSubquestModal,
  onSubquestConfirm,
  showShopModal,
  setShowShopModal,
  shopItems,
  coins,
  onBuy,
  showInventoryModal,
  setShowInventoryModal,
  inventory,
  applyItem,
}) => {
  return (
    <>
      <QuestModal
        show={showQuestModal}
        onClose={() => setShowQuestModal(false)}
        type={currentQuestType}
        onConfirm={onQuestConfirm}
      />
      <SubquestModal
        show={showSubquestModal}
        onClose={() => setShowSubquestModal(false)}
        onConfirm={onSubquestConfirm}
      />
      <ShopModal
        show={showShopModal}
        onClose={() => setShowShopModal(false)}
        items={shopItems}
        coins={coins}
        onBuy={onBuy}
      />
      <InventoryModal
        show={showInventoryModal}
        onClose={() => setShowInventoryModal(false)}
        inventory={inventory}
        applyItem={applyItem}
      />
    </>
  );
};

export default Modals;