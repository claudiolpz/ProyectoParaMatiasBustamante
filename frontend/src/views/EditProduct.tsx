import { useParams, useNavigate } from "react-router";
import ProductFormContainer from "../components/ProductFormContainer";


const EditProduct = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const handleSuccess = () => {
        // Redirigir a la lista después de editar exitosamente
        navigate('/', { replace: true });
    };

    return (
        <ProductFormContainer
            productId={id} 
            onSuccess={handleSuccess}
        />
    );
};

export default EditProduct;