import { ElementModels, LanguageVariantResponses, SharedModels } from '../../lib';
import * as responseJson from '../fake-responses/language-variants/fake-list-language-variants-of-content-type-with-components.json';
import { cmTestClient, getTestClientWithJson, testProjectId } from '../setup';


describe('List language variants of content type with components', () => {
    let response: LanguageVariantResponses.ListLanguageVariantsOfContentTypeWithComponentsResponse;

    beforeAll((done) => {
        getTestClientWithJson(responseJson).listLanguageVariantsOfContentTypeWithComponents()
            .byTypeCodename('xxx')
            .toObservable()
            .subscribe(result => {
                response = result;
                done();
            });
    });

    it(`url should be correct`, () => {
        const codenameUrl = cmTestClient.listLanguageVariantsOfContentTypeWithComponents().byTypeCodename('xCodename').getUrl();
        const externalIdUrl = cmTestClient.listLanguageVariantsOfContentTypeWithComponents().byTypeExternalId('xExternalId').getUrl();

        expect(codenameUrl).toEqual(`https://manage.kontent.ai/v2/projects/${testProjectId}/types/codename/xCodename/components`);
        expect(externalIdUrl).toEqual(`https://manage.kontent.ai/v2/projects/${testProjectId}/types/external-id/xExternalId/components`);
    });

    it(`response should be instance of ListLanguageVariantsOfContentTypeWithComponentsResponse class`, () => {
        expect(response).toEqual(jasmine.any(LanguageVariantResponses.ListLanguageVariantsOfContentTypeWithComponentsResponse));
    });

    it(`response should contain debug data`, () => {
        expect(response.debug).toBeDefined();
    });

    it(`response should contain data`, () => {
        expect(response.data).toBeDefined();
        expect(response.data.variants).toBeDefined();
    });

    it(`item properties should be mapped`, () => {
        let componentsChecked: boolean = false;
        let nestedElementChecked: boolean = false;

        expect(response.data.variants).toBeDefined();
        expect(response.data.variants.length).toEqual(responseJson.variants.length);
        expect(response.data.pagination).toEqual(jasmine.any(SharedModels.Pagination));

        response.data.variants.forEach(variant => {

            const originalItem = responseJson.variants.find(m => m.item.id === variant.item.id);

            if (!originalItem) {
                throw Error(`Could not find original item with id '${variant.item.id}'`);
            }

            expect(variant.item).toBeDefined();
            expect(variant.language).toBeDefined();
            expect(variant.elements).toBeDefined();
            expect(variant.lastModified).toEqual(jasmine.any(Date));
            expect(variant.workflowStep).toBeDefined();
            expect(variant.workflowStep.id).toEqual(originalItem.workflow_step.id);

            expect(variant.item).toEqual(jasmine.any(SharedModels.ReferenceObject));
            expect(variant.language).toEqual(jasmine.any(SharedModels.ReferenceObject));

            variant.elements.forEach(element => {
                const originalElement = originalItem.elements.find(m => m.element.id === element.element.id);

                expect(element).toEqual(jasmine.any(ElementModels.ContentItemElementWithComponents));

                if (!originalElement) {
                    throw Error(`Original element with id '${element.element.id}' was not found`);
                }

                if (Array.isArray(element.value)) {
                    element.value.forEach(elementReference => {
                        expect(elementReference).toEqual(jasmine.any(SharedModels.ReferenceObject));
                    });
                } else {
                    expect(element.value).toEqual(originalElement.value as string | number);
                }

                if (element.components.length) {
                    for (const component of element.components) {
                        componentsChecked = true;

                        const originalComponent = originalElement.components.find(m => m.id === component.id);
                        expect(originalComponent).toBeDefined();

                        if (!originalComponent) {
                            throw Error(`Invalid component with id '${component.id}'`);
                        }

                        expect(component).toEqual(jasmine.any(ElementModels.ContentItemElementComponent));
                        expect(component.id).toEqual(originalComponent.id);
                        expect(component.type).toEqual(originalComponent.type);

                        for (const nestedElement of component.elements) {
                            nestedElementChecked = true;
                            expect(nestedElement).toEqual(jasmine.any(ElementModels.ContentItemElementWithComponents));
                        }
                    }
                }
            });
        });

        expect(componentsChecked).toBeTruthy();
        expect(nestedElementChecked).toBeTruthy();
    });

});