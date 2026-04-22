import React, { useState } from 'react';
import { Button } from '@grafana/ui';
import { ThresholdsFormModal } from './ThresholdsFormModal';
import { ThresholdsConfig } from 'types';

interface Props {
  value?: any;
  onChange: (value: any) => void;
}

// MODIF: Componente criado para permitir a criação de thresholds padrão que podem ser compartilhados pelos elementos
export const ThreasholdsEditor: React.FC<Props> = ({ value, onChange }) => {
  const [showDetailModal, setShowDetailModal] = useState(false);

  const onSave = (newThresholds: ThresholdsConfig[]) => {
    onChange(newThresholds)
    setShowDetailModal(false)
  }

  return <>
    <Button onClick={() => setShowDetailModal(true)}>Configurar Thresholds Padrão</Button>

    {showDetailModal && (
      <ThresholdsFormModal
        value={value ?? []}
        onSave={onSave}
        onCancel={() => setShowDetailModal(false)}
      />
    )}
  </>
};