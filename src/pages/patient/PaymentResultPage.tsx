import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get('status');
  const appointmentId = searchParams.get('appointmentId');
  const isSuccess = status === 'success';

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          {isSuccess ? (
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          )}
        </div>

        <h2 className={`text-3xl font-bold mb-4 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
          {isSuccess ? 'Thanh toán Thành công!' : 'Thanh toán Thất bại'}
        </h2>
        
        <p className="text-gray-600 mb-8">
          {isSuccess 
            ? 'Cảm ơn bạn đã đặt cọc giữ chỗ. Lịch hẹn của bạn đã được xác nhận. Chúng tôi sẽ gửi thông báo chi tiết cho bạn.'
            : 'Giao dịch không thành công hoặc đã bị hủy. Lịch hẹn của bạn hiện tại chưa được xác nhận đặt cọc.'}
        </p>

        {appointmentId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-8 border border-gray-100">
            <span className="text-sm text-gray-500">Mã Lịch Hẹn</span>
            <p className="font-mono text-lg font-semibold text-gray-800">#{appointmentId}</p>
          </div>
        )}

        <div className="flex flex-col space-y-3">
          <button
            onClick={() => navigate('/patient/records')}
            className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              isSuccess 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'
                : 'bg-gray-800 hover:bg-gray-900 text-white'
            }`}
          >
            Về trang Lịch sử Khám bệnh
            <ArrowRight className="w-5 h-5" />
          </button>
          
          {!isSuccess && (
            <button
              onClick={() => navigate('/book')}
              className="w-full py-3 px-4 rounded-xl font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Thử Đặt lịch lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
