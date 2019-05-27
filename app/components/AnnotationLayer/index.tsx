/**
 *
 * AnnotationLayer
 *
 */

import { LayerGroup as LeafletLayerGroup, withLeaflet, MapLayerProps, FeatureGroup } from 'react-leaflet';
import React, { useCallback, useRef } from 'react';
import { SupportedShapes } from 'types';
import { DomEvent } from 'leaflet';
import EditControl from './EditControl';
import './styles.css';
// import useDebouncedCallback from 'use-debounce/lib/callback';

import Annotation from 'types/Annotation';
import { List } from 'immutable';
import AnnotationPolygon from './AnnotationPolygon';
import AnnotationCircle from './AnnotationCircle';
import { AnnotationShapes } from './types';
import { useDispatch } from 'utils/hooks';
import { editAnnotationAction } from 'containers/Editor/actions';
import AnnotationRectangle from './AnnotationRectangle';
import { fromJS } from 'utils/geo';

interface AnnotationLayerProps extends MapLayerProps {
  data: List<Annotation>;
  selectedAnnotations: List<Annotation>;
  leaflet;
  onLayerClick?: (annotation: Annotation) => any;
  onCreated?: any;
  editable?: boolean;
}

const GuessComponent: React.SFC<AnnotationShapes> = (props) => {
  const {annotation, onClick} = props;
  const geometry: any = annotation.type === 'Feature' ? annotation.geometry : annotation;
  const onLayerClick = useCallback((event) => {
    DomEvent.stopPropagation(event);
    return onClick && onClick(annotation);
  }, [onClick, annotation]);
  switch (geometry.type) {
    case 'Point':
      return <AnnotationCircle {...props} onClick={onLayerClick} />;
    case 'Polygon':
    case 'MultiPolygon':
      if (annotation.properties.type === SupportedShapes.rectangle) {
        return <AnnotationRectangle {...props} onClick={onLayerClick} />;
      }
      return <AnnotationPolygon {...props} onClick={onLayerClick} />;
  }
  return <React.Fragment />;
};

const AnnotationLayer: React.SFC<AnnotationLayerProps> = (props) => {
  const map = props.leaflet.map;

  const dispatch = useDispatch();

  const onEdit = useCallback((event) => {
    if (props.selectedAnnotations && containerRef.current && props.onCreated) {
      containerRef.current.leafletElement.getLayers().forEach((layer: any) => {
        const annotation = props.selectedAnnotations.find(
          (annotation) => annotation.properties.id === layer.options.properties.id,
        );
        if (annotation) {
          const feature = layer.toGeoJSON();
          if (annotation.properties.type === SupportedShapes.circle) {
            dispatch(
              editAnnotationAction(
                annotation,
                annotation.set(
                  'geometry',
                  fromJS(feature.geometry),
                ).setIn(
                  ['properties', 'radius'],
                  (layer as L.CircleMarker).getRadius(),
                ),
              ));
          } else {
            dispatch(
              editAnnotationAction(
                annotation,
                fromJS(feature).set('properties', annotation.properties),
              ),
            );
          }
        }
      });
      return;
    }
  }, [props.selectedAnnotations]);
  const onCreate = useCallback((event) => {
    if (event.layerType === SupportedShapes.circle) {
      const feature = event.layer.toGeoJSON();
      feature.properties.radius = (event.layer as L.CircleMarker).getRadius();
      event.layer.remove(map);
      return props.onCreated(feature);
    }
    const feature = event.layer.toGeoJSON();
    feature.properties.type = event.layerType;
    event.layer.remove(map);
    return props.onCreated(feature);
  }, []);

  const containerRef = useRef<FeatureGroup>(null);

  return (
    <LeafletLayerGroup>
      <FeatureGroup ref={containerRef}>
        {props.editable &&
          <EditControl
            position="topright"
            onEdited={onEdit}
            onCreated={onCreate}
            onEditMove={onEdit}
            onEditResize={onEdit}
            onEditVertex={onEdit}
            edit={{
              edit: false,
              remove: false,
            }}
            draw={{
              circlemarker: false,
              marker: false,
              polyline: false,
              circle: false,
              rectangle: false,
              polygon: false,
            }}
          />}
        {props.data.map((annotation) => {
          const selected = props.selectedAnnotations.contains(annotation);
          return (
            <GuessComponent
              className={`annotation-shape ${selected && 'annotation-shape__editing'}`}
              key={annotation.properties.id}
              color={selected ? 'black' : 'white'}
              weight={1.5}
              editable={props.editable}
              lineCap="butt"
              onClick={props.onLayerClick}
              annotation={annotation}
              selected={selected} />
          );
        })}
      </FeatureGroup>
    </LeafletLayerGroup>
  );
};

export default withLeaflet(AnnotationLayer);
