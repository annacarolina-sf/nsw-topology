import React, { useState } from 'react';
import { Modal, Button, Field, Input } from '@grafana/ui';
import { SECTION_HEADER } from 'styles/tokens';

interface Props {
    value?: any;
    onSave: (value: any) => void;
    onCancel: () => void;
}

export const ThresholdsFormModal: React.FC<Props> = ({
    value,
    onSave,
    onCancel,
}) => {
    const [thresholds, setThresholds] = useState(value ?? []);
    console.log('Modal aberto')
    console.log(value)
    console.log(thresholds)

    return (
        <Modal title={'Thresholds'} isOpen={true} onDismiss={onCancel}>
            <div style={SECTION_HEADER}>📌 Endpoints</div>
            <p>Testando...</p>

            <Field label="Value">
                <Input
                    type="text"
                    value={'Teste'}
                    onChange={(e) => setThresholds([])}
                />
            </Field>

            <Modal.ButtonRow>
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={() => onSave(value)}>
                    Save
                </Button>
            </Modal.ButtonRow>
        </Modal>
    );
};