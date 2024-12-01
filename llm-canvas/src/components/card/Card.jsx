// components/card/Card.jsx
import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import CardSection from './CardSection';
import { 
  CardContainer, 
  CardHeader, 
  AddSectionButton, 
  SectionsWrapper, 
  GlobalToggleButton,
  CardTitle,
  ButtonsContainer,
  EditButton,
  TitleContainer,
  DeleteButton
} from './Card.styles';

const Card = ({ id, sections, position, onAddSection, onInputChange, onDelete }) => {
  const [allExpanded, setAllExpanded] = useState(true);
  const [cardName, setCardName] = useState("Prompt Variations");
  const [isEditing, setIsEditing] = useState(false);
  const titleRef = useRef(null);

  const toggleAll = () => {
    setAllExpanded(!allExpanded);
    document.dispatchEvent(new CustomEvent('toggleAllSections', {
      detail: { expanded: !allExpanded }
    }));
  };

  const handleEditClick = () => {
    setIsEditing(true);
    // Focus the input after a short delay to ensure it's ready
    setTimeout(() => titleRef.current?.focus(), 0);
  };

  const handleTitleBlur = () => {
    setIsEditing(false);
  };

  return (
    <Draggable 
      bounds="parent" 
      grid={[20, 20]}
      handle=".drag-handle"
      defaultPosition={position}
    >
      <CardContainer>
        <CardHeader className="drag-handle">
          <DeleteButton 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            ✖
          </DeleteButton>
          <TitleContainer>
            <CardTitle
              ref={titleRef}
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              onBlur={handleTitleBlur}
              onMouseDown={(e) => e.stopPropagation()}
              isEditing={isEditing}
            />
            <EditButton 
              onClick={handleEditClick}
              onMouseDown={(e) => e.stopPropagation()}
            >
              ✎
            </EditButton>
          </TitleContainer>
          <ButtonsContainer>
            <GlobalToggleButton 
              onClick={(e) => {
                e.stopPropagation();
                toggleAll();
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {allExpanded ? '−' : '+'}
            </GlobalToggleButton>
            <AddSectionButton 
              onClick={() => onAddSection(id)}
              onMouseDown={(e) => e.stopPropagation()}
            >
              Add Variation
            </AddSectionButton>
          </ButtonsContainer>
        </CardHeader>
        <SectionsWrapper>
          {sections.map((section, index) => (
            <CardSection 
              key={section.id} 
              section={section}
              isLast={index === sections.length - 1}
              onInputChange={onInputChange}
            />
          ))}
        </SectionsWrapper>
      </CardContainer>
    </Draggable>
  );
};

export default Card;